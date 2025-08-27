const onchainKeys = [
    'funding_USDC_goal',
    'funding_duration_second',
    'usdc_contract_address',
    'platform_fee_percentage',
    'reward_fee_percentage'
];

const offchainKeys = [
    'title',
    'project_overview',
    'proposed_solution',
    'location',
    'cover_image_url',
    'tags',
    'CO2_reduction',
    'projected_roi',
    'projected_payback_period_months',
    'project_plan_url',
    'technical_specifications_urls',
    'third_party_verification_urls'
];

export const separateProjectData = (body) => {
    const onchainData = {};
    const offchainData = {};
    for (const key in body) {
        if (onchainKeys.includes(key)) {
            onchainData[key] = body[key];
        } else if (offchainKeys.includes(key)) {
            offchainData[key] = body[key];
        }
    }
    return { onchainData, offchainData };
};
