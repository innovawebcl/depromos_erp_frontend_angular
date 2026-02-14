import { AnnotationLevel } from "@core-interfaces/global";
import { IInstitutionAnnotationLevel } from "@core-ports/outputs/annotationLevel";

const defaultAnnotationLevelMap: Record<AnnotationLevel, string> = {
    [AnnotationLevel.Remedial]: 'Remedial',
    [AnnotationLevel.Positive]: 'Positiva',
    [AnnotationLevel.Low]: 'Leve',
    [AnnotationLevel.Severe]: 'Grave',
    [AnnotationLevel.VerySevere]: 'Gravísima',
    [AnnotationLevel.RemedialGeneral]: 'Remedial General',
    [AnnotationLevel.PositiveGeneral]: 'General Positiva',
    [AnnotationLevel.NegativeGeneral]: 'General Negativa',
};

export function mapAnnotationLevel(
    customAnnotationLevels: IInstitutionAnnotationLevel[],
    annotationLevel: string
) {
    const customLabel = customAnnotationLevels.find(
        (level) => level.annotation_level === annotationLevel
      )?.custom_label;
    return customLabel ?? defaultAnnotationLevelMap[annotationLevel as AnnotationLevel] ?? 'Desconocido';
}