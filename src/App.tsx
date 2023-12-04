/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */
import { FC, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { TonApi } from '@delab-team/ton-api-sdk'
import { AppInner } from '@delab-team/de-ui'

import { Home } from './pages/home'

import { ROUTES } from './utils/router'

import { Layout } from './layout'

import { Connect } from './logic/connect'

import { DeLabAddress, DeLabConnecting, DeLabEvent, DeLabNetwork, DeLabTypeConnect } from './types'

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

const DeLabConnector = new Connect('https://google.com', 'Test', 'mainnet')
export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)
    const [ firstRender2, setFirstRender2 ] = useState<boolean>(false)
    const [ isTg, setIsTg ] = useState<boolean>(false)

    const [ balance, setBalance ] = useState<string | undefined>(undefined)

    const [ isConnected, setIsConnected ] = useState<boolean>(false)
    const [ address, setAddress ] = useState<DeLabAddress>(undefined)
    const [ network, setNetwork ] = useState<DeLabNetwork>('mainnet')
    const [ typeConnect, setTypeConnect ] = useState<DeLabTypeConnect>(undefined)

    const api = new TonApi('AFXRKLZM2YCJ67AAAAAE4XDRSACSYEOYKQKOSUVUKMXNMP2AKUTWJ2UVBPTTQZWRGZMLALY', isTestnet)

    function listenDeLab () {
        DeLabConnector.on('connect', (data: DeLabEvent) => {
            setIsConnected(true)
            const connectConfig: DeLabConnecting = data.data
            setAddress(connectConfig.address)
            setTypeConnect(connectConfig.typeConnect)
            setNetwork(connectConfig.network)
        })

        DeLabConnector.on('disconnect', () => {
            setIsConnected(false)
            setAddress(undefined)
            setTypeConnect(undefined)
            setNetwork('mainnet')
            console.log('disconect')
        })

        DeLabConnector.on('error', (data: DeLabEvent) => {
            console.log('error-> ', data.data)
        })

        DeLabConnector.on('error-transaction', (data: DeLabEvent) => {
            console.log('error-transaction-> ', data.data)
        })

        DeLabConnector.on('error-toncoinwallet', (data: DeLabEvent) => {
            console.log('error-toncoinwallet-> ', data.data)
        })

        DeLabConnector.on('error-tonhub', (data: DeLabEvent) => {
            console.log('error-tonhub-> ', data.data)
        })

        DeLabConnector.on('error-tonkeeper', (data: DeLabEvent) => {
            console.log('error-tonkeeper-> ', data.data)
        })

        DeLabConnector.loadWallet()
    }

    useEffect(() => {
        if (!firstRender2 && DeLabConnector) {
            setFirstRender(true)
            listenDeLab()
        }
    }, [])

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
        if (address) {
            loadUser(address)
        }
    }, [ address ])

    return (
        <AppInner isTg={isTg}>
            <Layout DeLabConnectObject={DeLabConnector} address={address} isConnected={isConnected} scheme={'dark'}>
                <Routes>
                    <Route path={ROUTES.HOME} element={<Home address={address} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </AppInner>
    )
}
