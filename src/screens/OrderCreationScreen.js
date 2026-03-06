import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../theme';
import { LightHeader, Input, DropdownInput, Button } from '../components';
import { orderService } from '../services/orderService';
import { doctorService } from '../services/doctorService';
import { productService } from '../services/productService';
import { validateRequired } from '../utils/validators';

const QUANTITY_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const PickerModal = ({ visible, onClose, title, data, onSelect, labelKey }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <FlatList
          data={data}
          keyExtractor={(item, idx) => item._id || String(idx)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <Text style={styles.modalItemText}>
                {typeof labelKey === 'function' ? labelKey(item) : item[labelKey] || item}
              </Text>
            </TouchableOpacity>
          )}
          style={{ maxHeight: 300 }}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

const OrderCreationScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      // Load doctors and products independently so one failure doesn't block the other
      const [docResult, prodResult] = await Promise.allSettled([
        doctorService.getDoctors(),
        productService.getProducts(),
      ]);

      if (docResult.status === 'fulfilled') {
        const docData = docResult.value.data?.data || docResult.value.data || [];
        setDoctors(Array.isArray(docData) ? docData : []);
      } else {
        console.log('Doctor load error:', docResult.reason?.message);
      }

      if (prodResult.status === 'fulfilled') {
        const prodData = prodResult.value.data?.data || prodResult.value.data || [];
        setProducts(Array.isArray(prodData) ? prodData : []);
      } else {
        console.log('Product load error:', prodResult.reason?.message);
      }
    };
    loadData();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!selectedDoctor) newErrors.doctor = 'Doctor is required';
    const nameErr = validateRequired(patientName, 'Patient name');
    if (nameErr) newErrors.patientName = nameErr;
    if (!selectedProduct) newErrors.product = 'Product is required';
    if (!quantity) newErrors.quantity = 'Quantity is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orderData = {
        doctor: selectedDoctor._id,
        product: selectedProduct._id,
        patientName: patientName.trim(),
        quantity: parseInt(quantity, 10),
      };
      if (address.trim()) {
        orderData.address = { street: address.trim() };
      }
      if (selectedDate) {
        orderData.deliveryDate = selectedDate.toISOString();
      }
      if (comment.trim()) {
        orderData.comment = comment.trim();
      }
      await orderService.createOrder(orderData);
      navigation.navigate('Success', { type: 'order' });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const doctorLabel = selectedDoctor
    ? `${selectedDoctor.firstName?.startsWith('Dr.') ? '' : 'Dr. '}${selectedDoctor.firstName} ${selectedDoctor.lastName}`
    : '';
  const productLabel = selectedProduct ? selectedProduct.name : '';

  return (
    <View style={styles.container}>
      <LightHeader
        title="Order Creation"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Details */}
        <Text style={styles.sectionTitle}>Order Details</Text>

        <DropdownInput
          label="Doctor's Name"
          placeholder="Select practitioner"
          value={doctorLabel}
          onPress={() => setShowDoctorPicker(true)}
          required
        />
        {errors.doctor && <Text style={styles.errorText}>{errors.doctor}</Text>}

        <Input
          label="Patient Name"
          placeholder="Enter patient name"
          value={patientName}
          onChangeText={setPatientName}
        />
        {errors.patientName && <Text style={styles.errorText}>{errors.patientName}</Text>}

        <DropdownInput
          label="Product List"
          placeholder="Select product"
          value={productLabel}
          onPress={() => setShowProductPicker(true)}
        />
        {errors.product && <Text style={styles.errorText}>{errors.product}</Text>}

        <DropdownInput
          label="Product Quantity"
          placeholder="Select quantity"
          value={quantity}
          onPress={() => setShowQuantityPicker(true)}
        />
        {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}

        {/* Address Details */}
        <Text style={styles.sectionTitle}>Address Details</Text>

        <Input
          label="Address"
          placeholder="Enter delivery address"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
          <DropdownInput
            label="Delivery Date"
            placeholder="Select delivery date"
            value={deliveryDate}
            onPress={() => setShowDatePicker(true)}
            required
          />
        </TouchableOpacity>

        <Input
          label="Comment"
          placeholder="Enter your comments"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
        <Button
          title={submitting ? 'Submitting...' : 'Save'}
          onPress={handleSave}
          disabled={submitting}
        />
      </View>

      {/* Picker Modals */}
      <PickerModal
        visible={showDoctorPicker}
        onClose={() => setShowDoctorPicker(false)}
        title="Select Doctor"
        data={doctors}
        onSelect={setSelectedDoctor}
        labelKey={(d) => `${d.firstName?.startsWith('Dr.') ? '' : 'Dr. '}${d.firstName} ${d.lastName}`}
      />
      <PickerModal
        visible={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        title="Select Product"
        data={products}
        onSelect={setSelectedProduct}
        labelKey="name"
      />
      <PickerModal
        visible={showQuantityPicker}
        onClose={() => setShowQuantityPicker(false)}
        title="Select Quantity"
        data={QUANTITY_OPTIONS}
        onSelect={(q) => setQuantity(q)}
        labelKey={(q) => q}
      />

      {/* Date Picker */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker} transparent animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Select Delivery Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    const date = selectedDate || new Date();
                    const dd = String(date.getDate()).padStart(2, '0');
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const yyyy = date.getFullYear();
                    setDeliveryDate(`${dd}/${mm}/${yyyy}`);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  if (date) setSelectedDate(date);
                }}
                style={{ height: 200 }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (event.type === 'set' && date) {
                setSelectedDate(date);
                const dd = String(date.getDate()).padStart(2, '0');
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const yyyy = date.getFullYear();
                setDeliveryDate(`${dd}/${mm}/${yyyy}`);
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24315D',
    marginBottom: 16,
    marginTop: 8,
  },
  calendarIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#F14336',
    marginTop: -12,
    marginBottom: 12,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24315D',
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  modalItemText: {
    fontSize: 14,
    color: '#24315D',
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

export default OrderCreationScreen;
