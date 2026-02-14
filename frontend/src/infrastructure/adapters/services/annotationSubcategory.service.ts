import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@infra-env/environment';

@Injectable({
  providedIn: 'root',
})
export class AnnotationSubcategoryService {
  private readonly API_URL = `${environment.apiUrl}/subcategories`;

  constructor(private http: HttpClient) {}

  // Obtener todas las subcategorías
  getSubcategories(): Observable<any> {
    return this.http.get(`${this.API_URL}`);
  }

  // Obtener una subcategoría por ID
  getSubcategoryById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}`);
  }

  // Crear una nueva subcategoría
  createSubcategory(data: { institution_annotation_level_id: number; subcategory: string }): Observable<any> {
    return this.http.post(`${this.API_URL}`, data);
  }

  // Eliminar una subcategoría
  deleteSubcategory(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
  
  getSubcategoriesByInstitutionAnnotationLevel(institution_annotation_level_id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${institution_annotation_level_id}`);
  }

}
