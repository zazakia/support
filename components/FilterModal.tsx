import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { X, Filter } from 'lucide-react-native';
import { FilterModalProps, FilterOption, JobStatus, JobPriority } from '../types';

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onApplyFilters,
  statusOptions,
  priorityOptions,
  deviceTypeOptions,
}): React.ReactElement => {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string[]>([]);

  const toggleSelection = (
    value: string,
    selectedArray: string[],
    setSelectedArray: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter(item => item !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  };

  const handleApplyFilters = (): void => {
    onApplyFilters({
      status: selectedStatus as JobStatus[],
      priority: selectedPriority as JobPriority[],
      deviceType: selectedDeviceType,
    });
    onClose();
  };

  const handleClearFilters = (): void => {
    setSelectedStatus([]);
    setSelectedPriority([]);
    setSelectedDeviceType([]);
  };

  const FilterSection = ({ 
    title, 
    options, 
    selectedValues, 
    onToggle 
  }: {
    title: string;
    options: FilterOption[];
    selectedValues: string[];
    onToggle: (value: string) => void;
  }) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.filterOption,
            selectedValues.includes(option.id) && styles.filterOptionSelected
          ]}
          onPress={() => onToggle(option.id)}
        >
          <Text style={[
            styles.filterOptionText,
            selectedValues.includes(option.id) && styles.filterOptionTextSelected
          ]}>
            {option.label}
          </Text>
          {option.count !== undefined && (
            <Text style={[
              styles.filterOptionCount,
              selectedValues.includes(option.id) && styles.filterOptionCountSelected
            ]}>
              {option.count}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleContainer}>
            <Filter size={24} color="#1E293B" />
            <Text style={styles.modalTitle}>Filters</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <FilterSection
            title="Status"
            options={statusOptions}
            selectedValues={selectedStatus}
            onToggle={(value) => toggleSelection(value, selectedStatus, setSelectedStatus)}
          />

          <FilterSection
            title="Priority"
            options={priorityOptions}
            selectedValues={selectedPriority}
            onToggle={(value) => toggleSelection(value, selectedPriority, setSelectedPriority)}
          />

          <FilterSection
            title="Device Type"
            options={deviceTypeOptions}
            selectedValues={selectedDeviceType}
            onToggle={(value) => toggleSelection(value, selectedDeviceType, setSelectedDeviceType)}
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 12,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterOptionSelected: {
    backgroundColor: '#EBF4FF',
    borderColor: '#2563EB',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  filterOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  filterOptionCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Inter-Regular',
  },
  filterOptionCountSelected: {
    color: '#2563EB',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

export default FilterModal;