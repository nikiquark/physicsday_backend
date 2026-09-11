import { getCookie } from "@/lib/cookie";
import { API_BASE_URL } from "@/lib/constants";
import { toSitePath } from "@/lib/media";

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

export interface ContestWorkData {
  author_name: string;
  age: number;
  city: string;
  school: string;
  class_number: number | null;
  title: string;
  parent_name: string;
  email: string;
  phone: string;
  publication_consent: boolean;
  photo: File;
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

export interface CreatedContestWork {
  id: number;
  author_name: string;
  age: number;
  city: string;
  email: string;
  phone: string;
  title: string;
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
  /** Готовая строка вида «3 октября, 11:00» — собирается на сервере. */
  time: string;
  starts_at: string;
  image: string;
  address: string;
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

  /**
   * Работа на конкурс рисунков.
   *
   * Здесь XMLHttpRequest, а не fetch: fetch не умеет сообщать о ходе
   * отправки, а фотография рисунка весит до 15 МБ — на мобильном
   * интернете это десятки секунд, в которые человек видит только
   * крутилку и жмёт кнопку второй раз.
   */
  createContestWork(
    data: ContestWorkData,
    onProgress?: (percent: number) => void,
  ): Promise<CreatedContestWork> {
    const body = new FormData();
    body.append('author_name', data.author_name);
    body.append('age', String(data.age));
    body.append('city', data.city);
    body.append('email', data.email);
    body.append('phone', data.phone);
    body.append('publication_consent', String(data.publication_consent));
    body.append('photo', data.photo);
    // Необязательные поля не отправляем пустыми: DRF иначе запишет
    // в базу пустые строки вместо «не указано».
    if (data.school) body.append('school', data.school);
    if (data.title) body.append('title', data.title);
    if (data.parent_name) body.append('parent_name', data.parent_name);
    if (data.class_number !== null) body.append('class_number', String(data.class_number));

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('POST', `${this.baseURL}/contest/works`);
      request.withCredentials = true;
      request.setRequestHeader('Accept', 'application/json');

      // Content-Type выставляет браузер: в multipart нужна граница,
      // которую руками не собрать.
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        request.setRequestHeader('X-CSRFToken', csrfToken);
      }

      if (onProgress) {
        request.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
      }

      request.onload = () => {
        let parsed: unknown = {};
        try {
          parsed = JSON.parse(request.responseText);
        } catch {
          parsed = {};
        }

        if (request.status >= 200 && request.status < 300) {
          resolve(parsed as CreatedContestWork);
          return;
        }

        const details = parsed as DRFErrorDetails;
        const error: ApiError = {
          message: details.detail || `HTTP error! status: ${request.status}`,
          status: request.status,
          details,
        };
        reject(error);
      };

      request.onerror = () => {
        reject({ message: 'Failed to fetch', status: 0 } as ApiError);
      };

      request.send(body);
    });
  }

  // Workshops
  async getWorkshops(): Promise<Workshop[]> {
    const workshops = await this.makeRequest<Workshop[]>('/workshops/');
    return workshops.map((w) => ({ ...w, image: toSitePath(w.image) }));
  }

  // Institutes
  async getInstitutes(): Promise<Institute[]> {
    const institutes = await this.makeRequest<Institute[]>('/excursions/');
    return institutes.map((i) => ({ ...i, image: toSitePath(i.image) }));
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
        err.includes('Вы уже зарегистрировались на') ||
        err.includes('Вы уже записались на') ||
        err.includes('Вы уже подали работу')
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
        // Файл проверяется и на сервере: понятный текст про формат
        // или размер важнее общей фразы про поля.
        if (Array.isArray(error.details?.photo) && error.details.photo.length) {
          return error.details.photo[0];
        }
        return 'Проверьте правильность заполнения всех полей.';
      case 406:
        return 'К сожалению, места закончились.';
      case 413:
        // До Django запрос не дошёл: файл обрезал nginx.
        return 'Файл слишком большой. Попробуйте фото меньшего размера.';
      case 429:
        return 'С этого адреса отправлено слишком много заявок. Попробуйте позже.';
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