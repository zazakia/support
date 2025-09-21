import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { SearchBarProps } from '../types';

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search...", 
  onSearch, 
  onClear 
}): React.ReactElement => {
  const [query, setQuery] = useState('');

  const handleSearch = (text: string): void => {
    setQuery(text);
    onSearch(text);
  };

  const handleClear = (): void => {
    setQuery('');
    onSearch('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <Search size={20} color="#64748B" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor="#94A3B8"
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={20} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;