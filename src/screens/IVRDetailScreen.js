import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { LightHeader } from '../components';
import { ivrService } from '../services/ivrService';

const STATUS_STYLES = {
  submitted: { color: '#BB4D00', bg: '#FFF8DB', label: 'Submitted' },
  covered: { color: '#007A55', bg: '#DEFCED', label: 'Covered' },
  not_covered: { color: '#2958E8', bg: '#E6F1FF', label: 'Not Covered' },
  rejected: { color: '#C70036', bg: '#FFEBEC', label: 'Rejected' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const InfoCard = ({ label, children }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoBadge}>
      <Text style={styles.infoBadgeText}>{label}</Text>
    </View>
    {children}
  </View>
);

const IVRDetailScreen = ({ navigation, route }) => {
  const ivrId = route?.params?.ivrId;
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ivrService.getIVRById(ivrId);
      setRecord(response.data.data || response.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load record';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ivrId) fetchRecord();
  }, [ivrId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <LightHeader title="IVR Details" onBack={() => navigation.goBack()} />
        <ActivityIndicator color="#0089FF" style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.container}>
        <LightHeader title="IVR Details" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{error || 'Record not found'}</Text>
          <TouchableOpacity onPress={fetchRecord} style={styles.retryButton} activeOpacity={0.7}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusStyle = STATUS_STYLES[record.status] || STATUS_STYLES.submitted;
  const patientName = `${record.patient?.firstName || ''} ${record.patient?.lastName || ''}`.trim() || 'N/A';
  const dob = formatDate(record.patient?.dateOfBirth);
  const medicareId = record.insurance?.medicareId || '';
  const documents = record.documents || [];

  const openDocument = (url) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const isImage = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.gif') || lower.includes('.webp');
  };

  return (
    <View style={styles.container}>
      <LightHeader title="IVR Details" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Request ID & Status Card */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.requestIdLabel}>Request ID</Text>
            <Text style={styles.requestIdValue}>{record.requestId || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
        </View>

        {/* Patient Details */}
        <InfoCard label="Patient Details">
          <InfoRow label="Name" value={patientName} />
          <InfoRow label="Date of Birth" value={dob} />
        </InfoCard>

        {/* Insurance Details */}
        {!!medicareId && (
          <InfoCard label="Insurance">
            <InfoRow label="Medicare ID" value={medicareId} />
          </InfoCard>
        )}

        {/* Patient Comment */}
        {!!record.comment && (
          <InfoCard label="Patient Comment">
            <Text style={styles.commentText}>{record.comment}</Text>
          </InfoCard>
        )}

        {/* Admin Note */}
        {!!record.adminNote && (
          <View style={[styles.noteCard, styles.noteCardInfo]}>
            <Text style={[styles.noteLabel, styles.noteLabelInfo]}>Note</Text>
            <Text style={[styles.noteText, styles.noteTextInfo]}>{record.adminNote}</Text>
          </View>
        )}

        {/* Approval Document */}
        {!!record.approvalDocument && (
          <InfoCard label="Approval Document">
            <TouchableOpacity
              style={styles.docItem}
              onPress={() => openDocument(record.approvalDocument)}
              activeOpacity={0.7}
            >
              {isImage(record.approvalDocument) ? (
                <Image source={{ uri: record.approvalDocument }} style={styles.docThumbnail} resizeMode="cover" />
              ) : (
                <View style={[styles.docIconContainer, { backgroundColor: '#007A55' }]}>
                  <Text style={styles.docIcon}>PDF</Text>
                </View>
              )}
              <Text style={styles.docLink} numberOfLines={1}>Approval Document</Text>
              <Text style={styles.docOpen}>Open</Text>
            </TouchableOpacity>
          </InfoCard>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <InfoCard label="Documents">
            {documents.map((doc, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.docItem}
                onPress={() => openDocument(doc)}
                activeOpacity={0.7}
              >
                {isImage(doc) ? (
                  <Image source={{ uri: doc }} style={styles.docThumbnail} resizeMode="cover" />
                ) : (
                  <View style={styles.docIconContainer}>
                    <Text style={styles.docIcon}>PDF</Text>
                  </View>
                )}
                <Text style={styles.docLink} numberOfLines={1}>
                  {isImage(doc) ? `Image ${idx + 1}` : `Document ${idx + 1}`}
                </Text>
                <Text style={styles.docOpen}>Open</Text>
              </TouchableOpacity>
            ))}
          </InfoCard>
        )}

        {/* Submitted Info */}
        <InfoCard label="Submission Info">
          <InfoRow label="Submitted" value={formatDate(record.createdAt)} />
          {record.submittedBy && (
            <InfoRow
              label="Submitted By"
              value={`${record.submittedBy.firstName || ''} ${record.submittedBy.lastName || ''}`.trim()}
            />
          )}
          {record.reviewedBy && record.status !== 'submitted' && (
            <>
              <InfoRow
                label="Reviewed By"
                value={`${record.reviewedBy.firstName || ''} ${record.reviewedBy.lastName || ''}`.trim()}
              />
              <InfoRow label="Reviewed On" value={formatDate(record.reviewedAt)} />
            </>
          )}
        </InfoCard>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6C7490',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#0089FF',
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Header Card
  headerCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  requestIdLabel: {
    fontSize: 12,
    color: '#6C7490',
  },
  requestIdValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24315D',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Info Cards
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D6DCE8',
  },
  infoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  infoBadgeText: {
    fontSize: 11,
    color: '#0089FF',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6C7490',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#24315D',
    maxWidth: '60%',
    textAlign: 'right',
  },
  commentText: {
    fontSize: 13,
    color: '#24315D',
    lineHeight: 18,
  },
  // Note Card
  noteCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  noteCardInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BAE0FF',
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  noteLabelInfo: {
    color: '#0089FF',
  },
  noteText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  noteTextInfo: {
    color: '#24315D',
  },
  // Documents
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  docThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  docIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#FF4D6A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  docIcon: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  docLink: {
    flex: 1,
    fontSize: 13,
    color: '#24315D',
  },
  docOpen: {
    fontSize: 12,
    color: '#0089FF',
    fontWeight: '600',
  },
});

export default IVRDetailScreen;
