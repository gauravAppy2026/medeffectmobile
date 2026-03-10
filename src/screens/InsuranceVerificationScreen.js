import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../theme';
import { LightHeader, Input, Button } from '../components';
import { ivrService } from '../services/ivrService';
import { uploadService } from '../services/uploadService';
import { validateRequired } from '../utils/validators';

let DocumentPicker;
try {
  DocumentPicker = require('react-native-document-picker').default;
} catch (e) {
  DocumentPicker = null;
}

let ImagePicker;
try {
  ImagePicker = require('react-native-image-picker');
} catch (e) {
  ImagePicker = null;
}

const InsuranceVerificationScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [selectedDobDate, setSelectedDobDate] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [medicareId, setMedicareId] = useState('');
  const [comment, setComment] = useState('');
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const pickFromGallery = async () => {
    if (!ImagePicker) {
      Alert.alert('Info', 'Image picker is not available. Please rebuild the app.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0,
        quality: 0.8,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const newDocs = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        }));
        setDocuments((prev) => [...prev, ...newDocs]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const pickFromFiles = async () => {
    if (!DocumentPicker) {
      Alert.alert('Info', 'Document picker is not available in this environment');
      return;
    }
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });
      setDocuments((prev) => [...prev, ...result]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const pickDocument = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Choose from Gallery', 'Choose PDF File'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickFromGallery();
          if (buttonIndex === 2) pickFromFiles();
        },
      );
    } else {
      Alert.alert('Upload Document', 'Choose source', [
        { text: 'Gallery', onPress: pickFromGallery },
        { text: 'PDF File', onPress: pickFromFiles },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const removeDocument = (idx) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const newErrors = {};
    const fnErr = validateRequired(firstName, 'First name');
    if (fnErr) newErrors.firstName = fnErr;
    const lnErr = validateRequired(lastName, 'Last name');
    if (lnErr) newErrors.lastName = lnErr;
    if (!selectedDobDate && !dob.trim()) newErrors.dob = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Upload documents first
      const uploadedDocs = [];
      for (const doc of documents) {
        try {
          const uploadRes = await uploadService.uploadFile(doc);
          uploadedDocs.push(uploadRes.data.data?.url || uploadRes.data.data?.filePath || '');
        } catch (uploadErr) {
          console.log('Upload error:', uploadErr.message);
        }
      }

      // Build payload matching the backend CreateIVRDto structure:
      // { patient: { firstName, lastName, dateOfBirth, ... }, insurance: { ... }, comment, documents }
      const payload = {
        patient: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      };

      // Add date of birth as ISO string
      if (selectedDobDate) {
        payload.patient.dateOfBirth = selectedDobDate.toISOString();
      } else if (dob.trim()) {
        payload.patient.dateOfBirth = dob.trim();
      }

      // Add insurance info if provided
      if (medicareId.trim()) {
        payload.insurance = { medicareId: medicareId.trim() };
      }

      // Add comment (not "notes")
      if (comment.trim()) {
        payload.comment = comment.trim();
      }

      // Add uploaded documents
      const validDocs = uploadedDocs.filter(Boolean);
      if (validDocs.length > 0) {
        payload.documents = validDocs;
      }

      await ivrService.submitIVR(payload);
      navigation.navigate('Success', { type: 'ivr' });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit IVR request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LightHeader
        title="Insurance Verification Req..."
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.requiredNote}>Required information indicated by*</Text>

        {/* Patient Details */}
        <Text style={styles.sectionTitle}>Patient Details</Text>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
              required
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
              required
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>
        </View>

        <TouchableOpacity onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
          <View pointerEvents="none">
            <Input
              label="Date of Birth"
              placeholder="DD/MM/YYYY"
              value={selectedDobDate ? formatDate(selectedDobDate) : dob}
              editable={false}
              required
              rightIcon={<Text style={styles.calendarIcon}>📅</Text>}
            />
          </View>
        </TouchableOpacity>
        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

        {/* Medicare Insurance Information */}
        <Text style={styles.sectionTitle}>Medicare Insurance Information</Text>

        <Input
          label="Medicare ID Number"
          placeholder="Enter medicare ID number"
          value={medicareId}
          onChangeText={setMedicareId}
        />

        <Input
          label="Comment"
          placeholder="Enter your comments"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />

        {/* Documents */}
        <Text style={styles.sectionTitle}>Documents</Text>
        <Text style={styles.docLabel}>Image/PDF</Text>

        <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadPlus}>+</Text>
          </View>
          <Text style={styles.uploadText}>
            <Text style={styles.clickHere}>Tap here</Text> to{'\n'}
            upload image or pdf
          </Text>
        </TouchableOpacity>

        {/* Document list */}
        {documents.map((doc, idx) => (
          <View key={idx} style={styles.docItem}>
            <View style={styles.docInfo}>
              <Text style={styles.docFileName} numberOfLines={1}>
                {doc.name || 'Document'}
              </Text>
              {doc.size ? (
                <Text style={styles.docFileSize}>{formatFileSize(doc.size)}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => removeDocument(idx)}>
              <Text style={styles.docRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
        <Button
          title={submitting ? 'Submitting...' : 'Submit'}
          onPress={handleSubmit}
          disabled={submitting}
        />
      </View>

      {/* Date of Birth Picker */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDobPicker} transparent animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDobPicker(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => {
                    const date = selectedDobDate || new Date(1990, 0, 1);
                    setSelectedDobDate(date);
                    setDob(formatDate(date));
                    setShowDobPicker(false);
                  }}
                >
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDobDate || new Date(1990, 0, 1)}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(event, date) => {
                  if (date) setSelectedDobDate(date);
                }}
                style={{ height: 220 }}
                textColor="#000000"
                themeVariant="light"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      ) : (
        showDobPicker && (
          <DateTimePicker
            value={selectedDobDate || new Date(1990, 0, 1)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, date) => {
              setShowDobPicker(false);
              if (event.type === 'set' && date) {
                setSelectedDobDate(date);
                setDob(formatDate(date));
              }
            }}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  requiredNote: {
    fontSize: 12,
    color: '#6C7490',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24315D',
    marginBottom: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  calendarIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#F14336',
    marginTop: -12,
    marginBottom: 8,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#24315D',
    marginBottom: 8,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderColor: '#D6DCE8',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadPlus: {
    fontSize: 24,
    color: '#6C7490',
    fontWeight: '300',
  },
  uploadText: {
    fontSize: 12,
    color: '#6C7490',
    textAlign: 'center',
    lineHeight: 18,
  },
  clickHere: {
    color: '#0089FF',
    fontWeight: '600',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  docInfo: {
    flex: 1,
    marginRight: 10,
  },
  docFileName: {
    fontSize: 13,
    color: '#24315D',
  },
  docFileSize: {
    fontSize: 11,
    color: '#6C7490',
    marginTop: 2,
  },
  docRemove: {
    fontSize: 14,
    color: '#FF4D6A',
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
  },
  // Date picker modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24315D',
  },
  datePickerCancel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  datePickerDone: {
    fontSize: 14,
    color: '#0089FF',
    fontWeight: '600',
  },
});

export default InsuranceVerificationScreen;
