// Compatibility shim for legacy Database type references.
export type Database = {
  public: {
    Enums: {
      calculation_type:
        | "biometry" | "bpd" | "crl" | "efw" | "doppler"
        | "growth_curve" | "gestational" | "fertility"
        | "preeclampsia_risk" | "trisomy_risk";
    };
  };
};
