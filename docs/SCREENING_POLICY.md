# Screening policy: `label-details-v2.0`

PharmaLens performs preliminary label-details screening. It is not a counterfeit detector and does not establish authenticity, chemical composition, pharmaceutical quality, regulatory approval or safety.

## Evidence gates

1. A front-of-pack image is required.
2. The image must meet measured minimum dimensions and brightness/contrast rules. The sharpness signal is explicitly a heuristic.
3. OCR must produce enough readable text. OCR confidence is extraction confidence, never authenticity confidence.
4. The user reviews every extracted field. Corrections remain marked as manual.
5. Only a published, documented reference version may support comparison.
6. Current required comparison fields are strength and manufacturer.

When any gate is missing, the outcome is `Unable to verify`. Processing failure never becomes a favourable result.

## Outcomes

- `Reference match`: required label details are consistent with the published reference version. The UI calls this a label-details comparison, not a full visual packaging match.
- `Needs review`: an independently documented required field differs.
- `Unable to verify`: image, extraction, product or reference evidence is insufficient.

Reason codes include `IMAGE_UNREADABLE`, `PACKAGE_INCOMPLETE`, `REFERENCE_UNAVAILABLE`, `FIELD_EXTRACTION_UNCERTAIN`, `STRENGTH_MISMATCH`, `MANUFACTURER_MISMATCH` and `LABEL_DETAILS_CONSISTENT`.

## Expiry

Expiry is reported separately. `MM/YYYY` and `YYYY/MM` are supported. Formats such as `02/03/2027` remain ambiguous. An expired product is not automatically classified as falsified or as a packaging discrepancy.

## Unconfigured capabilities

No trained packaging-vision model, NAFDAC connection, manufacturer authentication service, barcode authenticity service or external review destination is configured. `modelIdentifier` therefore remains null and no model confidence is generated.
