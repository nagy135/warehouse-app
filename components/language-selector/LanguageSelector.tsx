import React from 'react'
import { useTranslation } from 'react-i18next'
import { Languages } from '~/i18n/languages'
import { Text } from '~/components/ui/text'
import { Button } from '../ui/button'
import { GlobeIcon } from 'lucide-react-native'

export const LanguageSelector: React.FC = () => {
    const { i18n, t } = useTranslation()

    const handleClick = (lng: Languages) => {
        i18n.changeLanguage(lng)
    }

    const langButton = (lang: Languages) => (
        <Button variant="secondary" onPress={() => handleClick(lang)}>
            <Text>
                <GlobeIcon className="pr-4" />
                {lang}
            </Text>
        </Button>
    )

    return <>{i18n.language === Languages.SLOVAK ? langButton(Languages.ENGLISH) : langButton(Languages.SLOVAK)}</>
}
