import {
  createPatient as _createPatient,
  updatePatient as _updatePatient,
  deletePatient as _deletePatient,
  createExam as _createExam,
  deleteExam as _deleteExam,
  updateMyProfile as _updateMyProfile,
  refreshSubscription as _refreshSubscription,
  createCheckout as _createCheckout,
  createPortal as _createPortal,
  type PatientCreate,
  type PatientUpdate,
  type ExamCreate,
  type ProfileUpdate,
  type CheckoutRequest,
} from "@workspace/api-client-react";

export const createPatient = (body: PatientCreate) => _createPatient(body);
export const updatePatient = (id: string, body: PatientUpdate) => _updatePatient(id, body);
export const deletePatient = (id: string) => _deletePatient(id);
export const createExam = (body: ExamCreate) => _createExam(body);
export const deleteExam = (id: string) => _deleteExam(id);
export const updateMyProfile = (body: ProfileUpdate) => _updateMyProfile(body);
export const refreshSubscription = () => _refreshSubscription();
export const createCheckout = (body: CheckoutRequest) => _createCheckout(body);
export const createPortal = () => _createPortal();
