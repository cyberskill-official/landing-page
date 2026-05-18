import { blockContent } from './block_content';
import { capability } from './capability';
import { caseStudy } from './case_study';
import { job } from './job';
import { teamMember } from './team_member';
import { testimonial } from './testimonial';

export const documentSchemas = [caseStudy, testimonial, capability, teamMember, job] as const;

export const schemaTypes = [blockContent, ...documentSchemas] as const;

export type CmsDocumentSchemaName = (typeof documentSchemas)[number]['name'];

