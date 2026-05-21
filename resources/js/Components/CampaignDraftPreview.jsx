import CampaignPreviewModal, { CampaignPreviewContent } from './CampaignPreview';

// Compatibility wrapper for older imports and file-based assertions.
// Banner/logo rendering now lives in CampaignPreview.jsx:
// src={previewCampaign.campaign_banner_url}
// src={previewCampaign.brand_logo_url}
export { CampaignPreviewContent };

export default CampaignPreviewModal;
