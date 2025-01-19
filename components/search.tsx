'use client';

import { useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GEO_API_URL, geoApiOptions } from '@/app/api';

interface SearchProps {
  onSearchChange: (searchData: { value: string; label: string }) => void;
}

export function SearchLocation({ onSearchChange }: SearchProps) {
  const [search, setSearch] = useState<{ value: string; label: string } | null>(null);

  // Fetch city options from API asynchronously
  const loadOptions = (inputValue: string) => {
    return fetch(`${GEO_API_URL}/cities?minPopulation=10000&namePrefix=${inputValue}`, geoApiOptions)
      .then((response) => response.json())
      .then((response) => {
        return {
          options: response.data.map((city: { latitude: number; longitude: number; name: string; countryCode: string }) => {
            return {
              value: `${city.latitude} ${city.longitude}`,
              label: `${city.name}, ${city.countryCode}`,
            };
          }),
        };
      })
      .catch((err) => {
        console.error(err);
        return { options: [] };
      });
  };

  // Handle the city selection change
  const handleOnChange = (newValue: { value: string; label: string } | null) => {
    if (newValue) {
      setSearch(newValue);
      onSearchChange(newValue); // Send the selected city data to the parent component
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Custom UI Input Component */}
    
      {/* AsyncPaginate with Custom UI */}
      <AsyncPaginate
        placeholder="Search for City"
        debounceTimeout={600}
        value={search}
        loadOptions={loadOptions}
        onChange={handleOnChange}
        className="w-full text-black rounded-xl px-4 py-3"
        styles={{
          control: (base) => ({
            ...base,
            background: 'transparent',
            border: '1px solid white',
            boxShadow: 'none',
            width: '100%',
            color: 'white',
            borderRadius: '12px', // Add border-radius for consistent styling
            padding: '0.75rem', // Match padding to your input field
          }),
          singleValue: (base) => ({
            ...base,
            color: 'white',
            borderRadius: '12px',
          }),
          input: (base) => ({
            ...base,
            color: 'white',
            borderRadius: '12px',
          }),
          placeholder: (base) => ({
            ...base,
            color: 'white',
            opacity: 0.5,
          }),
          menu: (base) => ({
            ...base,
            background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.3), rgba(63, 81, 181, 0.3))',
            border: 'none',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: 'none',
          }),
        }}
      />
    </div>
  );
}
