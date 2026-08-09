ALTER TABLE "log_configurations"
ADD COLUMN "template_slug" VARCHAR(100),
ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN "coordinate_system" VARCHAR(100) NOT NULL DEFAULT 'easting-northing',
ADD COLUMN "coordinate_system_unit" VARCHAR(50) NOT NULL DEFAULT 'meters',
ADD COLUMN "allow_coordinate_system_at_log" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allow_coordinate_system_at_project" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "auto_elevation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "coordinate_requirement" VARCHAR(50) NOT NULL DEFAULT 'can-be-null',
ADD COLUMN "allow_duplicate_project_numbers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "measurement_system" VARCHAR(50) NOT NULL DEFAULT 'metric',
ADD COLUMN "date_format" VARCHAR(50) NOT NULL DEFAULT 'DD/MM/YYYY',
ADD COLUMN "elevation_unit" VARCHAR(50) NOT NULL DEFAULT 'meters';
