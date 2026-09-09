import { useState } from 'react';
import { UserRole } from "@/lib/types";

export interface BaseFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  agreement: boolean;
}

export interface PhysicsDayFormData extends BaseFormData {
  school: string;
  class: string;
}

export interface StudentFormData extends BaseFormData {
  school: string;
  class_number: string;
}

export interface WorkshopFormData extends StudentFormData {
  selectedWorkshop: number | null;
}

export interface ExcursionFormData {
  name: string;
  email: string;
  phone: string;
  agreement: boolean;
  passport: string;
  underages_count: number;
  underages: string;
  ageConfirmation: boolean;
  citizenshipConfirmation: boolean;
  selectedInstitute: number | null;
}

type FormDataType = BaseFormData | PhysicsDayFormData | StudentFormData | WorkshopFormData | ExcursionFormData;

interface UseRegistrationFormProps<T extends FormDataType> {
  initialData: T;
  onSubmit: (data: T) => Promise<void>;
  validate?: (data: T) => string | null;
}

export function useRegistrationForm<T extends FormDataType>({
  initialData,
  onSubmit,
  validate
}: UseRegistrationFormProps<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      // Handle empty underages_count field - allow empty string, convert to 0 on submit
      if (name === 'underages_count') {
        setFormData(prev => ({
          ...prev,
          [name]: value === '' ? 0 : parseInt(value, 10) || 0
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: parseInt(value, 10) || 0
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateClass = (classStr: string): boolean => {
    if (classStr === 'preschool') return true;
    const classNum = parseInt(classStr, 10);
    return !isNaN(classNum) && classNum >= 1 && classNum <= 11;
  };

  const validateRequired = (data: T): string | null => {
    const baseRequiredFields = ['name', 'email', 'phone'];
    
    // Add conditional required fields based on form type
    const requiredFields = [...baseRequiredFields];
    
    if ('city' in data) {
      requiredFields.push('city');
    }
    
    if ('passport' in data) {
      requiredFields.push('passport');
    }

    const emptyFields = requiredFields.filter(field => !data[field as keyof T]);
    
    if (emptyFields.length > 0) {
      return 'Все обязательные поля должны быть заполнены.';
    }

    if (!data.agreement) {
      return 'Необходимо дать согласие на обработку персональных данных для продолжения регистрации.';
    }

    if (!validateEmail(data.email)) {
      return 'Пожалуйста, введите корректный email адрес.';
    }

    return null;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Basic validation
    const basicError = validateRequired(formData);
    if (basicError) {
      throw new Error(basicError);
    }

    // Custom validation
    if (validate) {
      const customError = validate(formData);
      if (customError) {
        throw new Error(customError);
      }
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData(initialData); // Reset form on success
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialData);
  };

  return {
    formData,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    resetForm,
    setFormData
  };
}

// Specific form validators
export const validatePhysicsDayForm = (data: PhysicsDayFormData, role: UserRole): string | null => {
  if (role === "Школьник") {
    if (!data.school || !data.class) {
      return 'Для школьников поля "Школа" и "Класс" обязательны для заполнения.';
    }
    
    if (data.class !== 'preschool') {
      const classNum = parseInt(data.class, 10);
      if (isNaN(classNum) || classNum < 1 || classNum > 11) {
        return 'Пожалуйста, выберите класс от 1 до 11 или Дошкольник.';
      }
    }
  }
  
  return null;
};

export const validateStudentForm = (data: StudentFormData): string | null => {
  const requiredFields = ['class_number'];
  const emptyFields = requiredFields.filter(field => !data[field as keyof StudentFormData]);
  
  if (emptyFields.length > 0) {
    return 'Необходимо выбрать класс.';
  }
  
  if (data.class_number !== 'preschool') {
    const classNum = parseInt(data.class_number, 10);
    if (isNaN(classNum) || classNum < 1 || classNum > 11) {
      return 'Пожалуйста, выберите класс от 1 до 11 или Дошкольник.';
    }
  }
  
  return null;
};

export const validateWorkshopForm = (data: WorkshopFormData): string | null => {
  const studentError = validateStudentForm(data);
  if (studentError) return studentError;
  
  if (!data.selectedWorkshop) {
    return 'Необходимо выбрать мастер-класс для регистрации.';
  }
  
  return null;
};

export const validateExcursionForm = (data: ExcursionFormData): string | null => {
  if (!data.selectedInstitute) {
    return 'Необходимо выбрать институт для регистрации.';
  }
  
  if (!data.ageConfirmation) {
    return 'Необходимо подтвердить, что вам исполнилось 18 лет.';
  }

  if (!data.citizenshipConfirmation) {
    return 'Необходимо подтвердить, что вы являетесь гражданином РФ.';
  }
  
  if (data.underages_count < 0) {
    return 'Количество детей не может быть отрицательным.';
  }
  
  if (data.underages_count > 0 && !data.underages.trim()) {
    return 'Если указано количество детей, необходимо заполнить информацию о них.';
  }
  
  return null;
};