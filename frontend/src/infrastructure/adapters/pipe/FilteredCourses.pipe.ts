import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Pipe({
  name: 'filterCourses',
  pure: false,
  standalone: true,
})
export class FilterCoursesPipe implements PipeTransform {
  transform(courses: FormGroup[], search: string): any[] {
    if (!courses || !search) {
      return courses;
    }
    const searchLower = search.toLowerCase();
    const filter = courses.filter((course) =>
      course.get('title')?.value.toLowerCase().includes(searchLower)
    );
    return filter;
  }
}
