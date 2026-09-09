import { getCookie } from "@/lib/cookie";
import { API_BASE_URL } from "@/lib/constants";

// Types
export interface BaseParticipantData {
  name: string;
  email: string;
  phone: string;
  city: string;
}

export interface PhysicsDayParticipantData extends BaseParticipantData {
  role: string;
  school: string | null;
  class_number: number | null;
}

export interface OlympiadParticipantData extends BaseParticipantData {
  school: string;
  class_number: number;
}

export interface WorkshopParticipantData extends BaseParticipantData {
  school: string;
  class_number: number;
  workshop: number;
}

export interface ExcursionParticipantData {
  name: string;
  email: string;
  phone: string;
  passport: string;
  underages_count: number;
  underages: string;
  institute: number;
}

// Response types for created participants (what DRF returns)
export interface CreatedParticipant {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  created_at?: string;
}

export interface CreatedPhysicsDayParticipant extends CreatedParticipant {
  role: string;
  school: string | null;
  class_number: number | null;
}

export interface CreatedOlympiadParticipant extends CreatedParticipant {
  school: string;
  class_number: number;
}

export interface CreatedWorkshopParticipant extends CreatedParticipant {
  school: string;
  class_number: number;
  workshop: number;
}

export interface CreatedExcursionParticipant {
  id: number;
  name: string;
  email: string;
  phone: string;
  passport: string;
  underages_count: number;
  underages: string;
  institute: number;
}

export interface Workshop {
  id: number;
  name: string;
  restriction: string;
  time: string;
  room: string;
  limit: number;
  limit_left: number;
  ordering: number;
  image: string;
}

export interface Institute {
  id: number;
  name: string;
  limit: number;
  limit_left: number;
  time: string;
  image: string;
  adress: string;
  ordering: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

// DRF standard error structure
export interface DRFFieldError {
  [fieldName: string]: string[];
}

export interface DRFErrorDetails {
  detail?: string;
  non_field_errors?: string[];
  [fieldName: string]: string | string[] | undefined;
}

export interface ApiError {
  message: string;
  status: number;
  details?: DRFErrorDetails;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const csrfToken = getCookie('csrftoken');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const errorData: DRFErrorDetails = await response.json().catch(() => ({}));
      const error: ApiError = {
        message: errorData.detail || `HTTP error! status: ${response.status}`,
        status: response.status,
        details: errorData
      };
      throw error;
    }

    return response.json();
  }

  // Physics Day participants
  async createPhysicsDayParticipant(data: PhysicsDayParticipantData): Promise<CreatedPhysicsDayParticipant> {
    return this.makeRequest<CreatedPhysicsDayParticipant>('/physicsday/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Olympiad participants
  async createOlympiadParticipant(data: OlympiadParticipantData): Promise<CreatedOlympiadParticipant> {
    return this.makeRequest<CreatedOlympiadParticipant>('/olympiads/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Workshop participants
  async createWorkshopParticipant(data: WorkshopParticipantData): Promise<CreatedWorkshopParticipant> {
    return this.makeRequest<CreatedWorkshopParticipant>('/workshops/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Excursion participants
  async createExcursionParticipant(data: ExcursionParticipantData): Promise<CreatedExcursionParticipant> {
    return this.makeRequest<CreatedExcursionParticipant>('/excursions/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Workshops
  async getWorkshops(): Promise<Workshop[]> {
    return this.makeRequest<Workshop[]>('/workshops/');
  }

  // Institutes
  async getInstitutes(): Promise<Institute[]> {
    return this.makeRequest<Institute[]>('/excursions/');
  }
}

// Create singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Type guard for ApiError
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    if (error.message.includes('Failed to fetch')) {
      return 'Не удается подключиться к серверу. Проверьте подключение к интернету.';
    }
    
    // Проверяем на ошибку дублирования участника
    if (error.details?.non_field_errors) {
      const duplicateError = error.details.non_field_errors.find(err => 
        err.includes('Вы уже зарегистрировались на') || err.includes('Вы уже записались на')
      );
      if (duplicateError) {
        return duplicateError;
      }
    }
    
    switch (error.status) {
      case 400:
        // Проверяем наличие специфических ошибок в деталях
        if (error.details?.non_field_errors?.length) {
          return error.details.non_field_errors[0];
        }
        return 'Проверьте правильность заполнения всех полей.';
      case 406:
        return 'К сожалению, места закончились.';
      case 500:
        return 'Ошибка сервера. Попробуйте позже.';
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Произошла неизвестная ошибка. Попробуйте позже.';
};

// Utility function to extract field errors from DRF response
export const getFieldErrors = (error: unknown): Record<string, string[]> => {
  if (isApiError(error) && error.details) {
    const fieldErrors: Record<string, string[]> = {};
    
    Object.entries(error.details).forEach(([key, value]) => {
      if (key !== 'detail' && Array.isArray(value)) {
        fieldErrors[key] = value;
      } else if (key !== 'detail' && typeof value === 'string') {
        fieldErrors[key] = [value];
      }
    });
    
    return fieldErrors;
  }
  
  return {};
};