database tables information

create table public.admin (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone not null default now(),
first_name text not null,
middle_name text null,
last_name text null,
address text not null,
username text not null,
contact text not null,
constraint admin_pkey primary key (id),
constraint admin_username_key unique (username)
) TABLESPACE pg_default;

create table public.appointments (
id uuid not null default gen_random_uuid (),
patient_id text not null,
appointment_date_time timestamp with time zone not null,
status text not null default 'scheduled'::text,
reason text null,
mode text not null default 'in-person'::text,
location_link text null,
things_to_bring text null,
duration interval null,
notes_for_doctor text null,
doctor_notes text null,
created_at timestamp with time zone not null default now(),
doctor_id integer not null,
constraint appointments_pkey primary key (id),
constraint appointments_doctor_id_fkey foreign KEY (doctor_id) references doctor (doctor_id),
constraint appointments_patient_id_fkey foreign KEY (patient_id) references users (patient_id) on update CASCADE on delete CASCADE,
constraint appointments_mode_check check (
(
mode = any (
array['in-person'::text, 'online'::text, 'phone'::text]
)
)
),
constraint appointments_status_check check (
(
status = any (
array[
'scheduled'::text,
'completed'::text,
'cancelled'::text,
'rescheduled'::text,
'no-show'::text,
'Not Approved'::text
]
)
)
)
) TABLESPACE pg_default;

create table public.breath_analysis (
id serial not null,
patient_id text null,
ammonia_ppm double precision null,
co2_ppm_mq double precision null,
benzene_ppm double precision null,
co2_ppm_mhz19 double precision null,
ethanol_ppm double precision null,
vocs_ppm_mics double precision null,
acetone_ppm_qcm double precision null,
voc_type_chemo character varying(100) null,
voc_value_ppm_chemo double precision null,
recorded_at timestamp without time zone null default CURRENT_TIMESTAMP,
constraint breath_analysis_pkey primary key (id),
constraint breath_analysis_patient_id_fkey foreign KEY (patient_id) references users (patient_id)
) TABLESPACE pg_default;

create table public.doctor (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone not null default now(),
country text not null,
first_name text not null,
middle_name text null,
last_name text null,
username text not null,
address text not null,
contact text not null,
gender text not null,
degrees text not null,
medical_license_number text null,
training_history text null,
area_of_expertise text null,
doctor_id integer null,
constraint doctor_pkey primary key (id),
constraint doctor_doctor_id_key unique (doctor_id)
) TABLESPACE pg_default;

create table public.doctor_patient_assignment (
id bigserial not null,
doctor_id integer not null,
patient_id text not null,
assigned_at timestamp with time zone null default now(),
constraint doctor_patient_assignment_pkey primary key (id),
constraint doctor_patient_assignment_doctor_id_patient_id_key unique (doctor_id, patient_id),
constraint doctor_patient_assignment_doctor_id_fkey foreign KEY (doctor_id) references doctor (doctor_id),
constraint doctor_patient_assignment_patient_id_fkey foreign KEY (patient_id) references users (patient_id)
) TABLESPACE pg_default;
create table public.patient_predictions_cache (
id bigint generated always as identity not null,
patient_id text not null,
summary text null,
risk_assessment text null,
model_used text not null default 'gemini-2.5-pro'::text,
created_at timestamp with time zone null default now(),
constraint patient_predictions_cache_pkey primary key (id),
constraint patient_predictions_cache_patient_id_fkey foreign KEY (patient_id) references users (patient_id)
) TABLESPACE pg_default;

create table public.prescriptions (
id uuid not null default gen_random_uuid (),
medicines jsonb not null,
description text null,
created_at timestamp with time zone null default now(),
doctor_id integer not null,
patient_id text not null,
constraint prescriptions_pkey primary key (id),
constraint prescriptions_doctor_id_fkey foreign KEY (doctor_id) references doctor (doctor_id),
constraint prescriptions_patient_id_fkey foreign KEY (patient_id) references users (patient_id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create table public.users (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone not null default now(),
first_name text not null,
middle_name text null,
last_name text not null,
gender text not null,
date_of_birth date null,
country text not null,
user_contact text null,
emergency_contact text null,
medical_history text null,
address text not null,
patient_id text null,
constraint user_pkey primary key (id),
constraint users_patient_id_key unique (patient_id)
) TABLESPACE pg_default;

create table public.vitals_monitoring (
id serial not null,
patient_id text null,
heart_rate_bpm integer null,
pulse_bpm integer null,
spo2_percent double precision null,
body_temp_c double precision null,
ecg_signal_raw text null,
ecg_rhythm_type character varying(50) null,
systolic_bp integer null,
diastolic_bp integer null,
mean_bp integer null,
recorded_at timestamp without time zone null default CURRENT_TIMESTAMP,
constraint vitals_monitoring_pkey primary key (id),
constraint vitals_monitoring_patient_id_fkey foreign KEY (patient_id) references users (patient_id)
) TABLESPACE pg_default;
