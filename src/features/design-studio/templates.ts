import { DesignTemplate } from './types';
import { appleTemplates } from './templates-apple';
import { generalTemplates } from './templates-general';

export const DESIGN_TEMPLATES: DesignTemplate[] = [...appleTemplates, ...generalTemplates];
