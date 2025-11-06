"""
Multi-language SMS Templates for FarmOracle
Supports English, Swahili, and French
"""

# Disease Alert Templates
DISEASE_ALERT = {
    'en': "⚠️ FARMORACLE ALERT\nDisease detected in your {crop}!\nDisease: {disease}\nConfidence: {confidence}%\nAction: Harvest within 48 hours to minimize loss.\nContact extension officer immediately.",
    
    'sw': "⚠️ ARIFA YA FARMORACLE\nUgonjwa umegunduliwa katika {crop} yako!\nUgonjwa: {disease}\nUiminifu: {confidence}%\nHatua: Vuna ndani ya masaa 48 kupunguza hasara.\nWasiliana na afisa wa ugani mara moja.",
    
    'fr': "⚠️ ALERTE FARMORACLE\nMaladie détectée dans votre {crop}!\nMaladie: {disease}\nConfiance: {confidence}%\nAction: Récolter dans 48 heures pour minimiser les pertes.\nContactez immédiatement l'agent de vulgarisation."
}

# Price Alert Templates
PRICE_ALERT = {
    'en': "💰 FARMORACLE PRICE ALERT\nCrop: {crop}\nCurrent: ${current_price}\nPredicted: ${predicted_price} ({change}%)\nRecommendation: {recommendation}\nAct within 7 days for best returns.",
    
    'sw': "💰 ARIFA YA BEI YA FARMORACLE\nZao: {crop}\nSasa: ${current_price}\nInatabirika: ${predicted_price} ({change}%)\nMapendekezo: {recommendation}\nFanya hatua ndani ya siku 7 kwa faida bora.",
    
    'fr': "💰 ALERTE PRIX FARMORACLE\nCulture: {crop}\nActuel: ${current_price}\nPrévu: ${predicted_price} ({change}%)\nRecommandation: {recommendation}\nAgir dans 7 jours pour de meilleurs rendements."
}

# Weather Alert Templates
WEATHER_ALERT = {
    'en': "🌦️ FARMORACLE WEATHER ALERT\nCondition: {condition}\nAction: {action}\nProtect your crops immediately.\nCheck app for detailed forecast.",
    
    'sw': "🌦️ ARIFA YA HALI YA HEWA YA FARMORACLE\nHali: {condition}\nHatua: {action}\nLinda mazao yako mara moja.\nAngalia programu kwa utabiri wa kina.",
    
    'fr': "🌦️ ALERTE MÉTÉO FARMORACLE\nCondition: {condition}\nAction: {action}\nProtégez vos cultures immédiatement.\nConsultez l'application pour des prévisions détaillées."
}

# Harvest Reminder Templates
HARVEST_REMINDER = {
    'en': "🌾 FARMORACLE REMINDER\nYour {crop} is ready for harvest in {days} days.\nPrepare equipment and labor.\nCheck market prices before harvesting.",
    
    'sw': "🌾 KIKUMBUSHO CHA FARMORACLE\n{crop} yako iko tayari kuvunwa katika siku {days}.\nAndaa vifaa na wafanyakazi.\nAngalia bei za soko kabla ya kuvuna.",
    
    'fr': "🌾 RAPPEL FARMORACLE\nVotre {crop} sera prêt à récolter dans {days} jours.\nPréparez l'équipement et la main-d'œuvre.\nVérifiez les prix du marché avant la récolte."
}

# Soil Recommendation Templates
SOIL_RECOMMENDATION = {
    'en': "🌍 FARMORACLE SOIL ANALYSIS\nSoil Type: {soil_type}\nBest crops: {crops}\nApply organic fertilizer for optimal yield.\nLogin to app for full report.",
    
    'sw': "🌍 UCHAMBUZI WA UDONGO WA FARMORACLE\nAina ya Udongo: {soil_type}\nMazao bora: {crops}\nTumia mbolea asilia kwa mavuno bora.\nIngia kwenye programu kwa ripoti kamili.",
    
    'fr': "🌍 ANALYSE DU SOL FARMORACLE\nType de sol: {soil_type}\nMeilleures cultures: {crops}\nAppliquer de l'engrais organique pour un rendement optimal.\nConnectez-vous à l'application pour le rapport complet."
}

# NFT Minted Templates
NFT_MINTED = {
    'en': "🎨 FARMORACLE NFT MINTED\nType: {nft_type}\nToken ID: {token_id}\nYour crop is now tokenized on blockchain!\nView in app to stake and earn rewards.",
    
    'sw': "🎨 NFT YA FARMORACLE IMETENGENEZWA\nAina: {nft_type}\nKitambulisho cha Tokeni: {token_id}\nMazao yako sasa yamebadilishwa kuwa tokeni kwenye blockchain!\nTazama kwenye programu kuweka na kupata tuzo.",
    
    'fr': "🎨 NFT FARMORACLE CRÉÉ\nType: {nft_type}\nID Token: {token_id}\nVotre culture est maintenant tokenisée sur la blockchain!\nConsultez l'application pour miser et gagner des récompenses."
}

# Staking Reward Templates
STAKING_REWARD = {
    'en': "💎 FARMORACLE REWARDS\nYou earned ${amount} from staking your {crop} NFT!\nClaim rewards in app.\nKeep staking to earn more.",
    
    'sw': "💎 TUZO ZA FARMORACLE\nUmepata ${amount} kutoka kuweka NFT ya {crop} yako!\nDai tuzo kwenye programu.\nEndelea kuweka ili kupata zaidi.",
    
    'fr': "💎 RÉCOMPENSES FARMORACLE\nVous avez gagné ${amount} en misant votre NFT {crop}!\nRéclamez les récompenses dans l'application.\nContinuez à miser pour gagner plus."
}

# Marketplace Sale Templates
MARKETPLACE_SALE = {
    'en': "✅ FARMORACLE SALE\nYour {crop} sold!\nQuantity: {quantity} units\nPrice: ${price}\nPayment processing. Check app for details.",
    
    'sw': "✅ MAUZO YA FARMORACLE\n{crop} yako imeuzwa!\nKiasi: vitengo {quantity}\nBei: ${price}\nMalipo yanachakatwa. Angalia programu kwa maelezo.",
    
    'fr': "✅ VENTE FARMORACLE\nVotre {crop} vendu!\nQuantité: {quantity} unités\nPrix: ${price}\nTraitement du paiement. Consultez l'application pour plus de détails."
}


def get_template(template_type, language='en'):
    """Get SMS template by type and language"""
    templates = {
        'disease': DISEASE_ALERT,
        'price': PRICE_ALERT,
        'weather': WEATHER_ALERT,
        'harvest': HARVEST_REMINDER,
        'soil': SOIL_RECOMMENDATION,
        'nft': NFT_MINTED,
        'reward': STAKING_REWARD,
        'sale': MARKETPLACE_SALE
    }
    
    template_dict = templates.get(template_type, {})
    return template_dict.get(language, template_dict.get('en', ''))


def format_message(template_type, language='en', **kwargs):
    """Format SMS message with parameters"""
    template = get_template(template_type, language)
    
    try:
        return template.format(**kwargs)
    except KeyError as e:
        print(f"Missing parameter: {e}")
        return template


if __name__ == "__main__":
    # Test templates
    print("Testing Multi-Language SMS Templates\n")
    
    # Test disease alert in all languages
    print("=== Disease Alert ===")
    for lang in ['en', 'sw', 'fr']:
        msg = format_message('disease', lang, 
                           crop='Tomato', 
                           disease='Late Blight', 
                           confidence=94)
        print(f"\n{lang.upper()}:\n{msg}\n")
    
    # Test price alert
    print("\n=== Price Alert ===")
    for lang in ['en', 'sw', 'fr']:
        msg = format_message('price', lang,
                           crop='Wheat',
                           current_price='100.00',
                           predicted_price='120.00',
                           change='+20.0',
                           recommendation='HOLD')
        print(f"\n{lang.upper()}:\n{msg}\n")
