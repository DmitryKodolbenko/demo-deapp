/* eslint-disable no-nested-ternary */
import { FC, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { useTonAddress } from '@tonconnect/ui-react'
import { TonApi } from '@delab-team/ton-api-sdk'
import { AppInner } from '@delab-team/de-ui'

import { Home } from './pages/home'

import { ROUTES } from './utils/router'

import { Layout } from './layout'

declare global {
    interface Window {
        Telegram?: any;
    }
}

const isTestnet = window.location.host.indexOf('localhost') >= 0
    || window.location.host.indexOf('127.0.0.1:3000') >= 0
    ? 'testnet'
    : window.location.href.indexOf('testnet') >= 0
        ? 'testnet'
        : 'mainnet'

export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)
    const [ isTg, setIsTg ] = useState<boolean>(false)

    const [ balance, setBalance ] = useState<string | undefined>(undefined)

    const RawAddress = useTonAddress()

    const api = new TonApi('AFXRKLZM2YCJ67AAAAAE4XDRSACSYEOYKQKOSUVUKMXNMP2AKUTWJ2UVBPTTQZWRGZMLALY', isTestnet)

    async function loadUser (address: string): Promise<boolean | undefined> {
        const data = await api.Accounts.getHumanFriendlyInfo(address)

        if (!data || !data?.balance) {
            return undefined
        }

        setBalance(data?.balance.toString())

        return true
    }

    // load user
    useEffect(() => {
        if (RawAddress) {
            loadUser(RawAddress)
        }
    }, [ RawAddress ])

    // init twa
    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)

            const isTgCheck = window.Telegram.WebApp.initData !== ''
            const TgObj = window.Telegram.WebApp
            const bodyStyle = document.body.style

            if (isTgCheck) {
                TgObj.ready()
                TgObj.enableClosingConfirmation()
                TgObj.expand()
                setIsTg(true)

                bodyStyle.backgroundColor = 'var(--tg-theme-bg-color)'
                bodyStyle.setProperty('background-color', 'var(--tg-theme-bg-color)', 'important')
            }
        }
    }, [])

    return (
        <AppInner isTg={isTg}>
            <Layout>
                <Routes>
                    <Route path={ROUTES.HOME} element={<Home />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </AppInner>
    )
}
