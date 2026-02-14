
import { Kinship } from '@core-interfaces/global';

export function parseKinship(kinship: Kinship) {
    switch (kinship) {
        case Kinship.Father:
            return 'Padre';
        case Kinship.Mother:
            return 'Madre';
        case Kinship.Grandparent:
            return 'Abuelo/a';
        case Kinship.Uncle:
            return 'Tío/a';
        case Kinship.Aunt:
            return 'Tía/o';
        case Kinship.Other:
            return 'Otro';
        default:
            return 'Otro';
    }
}