import React from 'react';
import { ChevronDownIcon } from './Icons';

interface FormFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  name: string;
  type?: 'text' | 'select' | 'password';
  options?: string[];
}

const FormField: React.FC<FormFieldProps> = ({ label, value, isEditing, onChange, name, type = 'text', options = [] }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={name} className="text-slate-600 text-sm font-semibold">{label}</label>
    {type === 'select' ? (
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={!isEditing}
          className="appearance-none w-full bg-slate-100 rounded-lg px-4 py-3 text-slate-800 border border-transparent disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        >
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <ChevronDownIcon />
        </div>
      </div>
    ) : (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={!isEditing}
        placeholder={`Your ${label}`}
        className="w-full bg-slate-100 rounded-lg px-4 py-3 text-slate-800 border border-transparent placeholder-slate-400 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
      />
    )}
  </div>
);

export default FormField;
