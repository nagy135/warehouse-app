import React from 'react'
import { useTranslation } from 'react-i18next'
import { Languages } from '~/i18n/languages'
import { Text } from '~/components/ui/text'
import { Button } from '../ui/button'
import { GlobeIcon } from '~/lib/icons/Globe'
import { View } from 'react-native'

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation()

    const handleClick = (lng: Languages) => {
        i18n.changeLanguage(lng)
    }

    const langButton = (lang: Languages) => (
        <Button variant="secondary" onPress={() => handleClick(lang)} >
            <View className='flex flex-row'>
                <GlobeIcon
                    className="text-foreground mr-1"
                    size={23}
                    strokeWidth={1.25}
                />
                <Text>
                    {lang}
                </Text>
            </View>
        </Button>
    )

    return <>{i18n.language === Languages.SLOVAK ? langButton(Languages.ENGLISH) : langButton(Languages.SLOVAK)}</>
}
