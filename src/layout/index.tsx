/* eslint-disable max-len */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/func-call-spacing */
import { FC } from 'react'
import { Link } from 'react-router-dom'

import { HeaderPanel, PageWrapper, Text } from '@delab-team/de-ui'

import { Modal } from '../components/modal'
import { Button } from '../components/button'

import { ROUTES } from '../utils/router'

import { Connect } from '../logic/connect'

import { DeLabAddress } from '../types'

import s from './layout.module.scss'

type DeLabScheme = 'dark' | 'light'

interface LayoutProps {
    children: React.ReactNode;
    DeLabConnectObject: Connect,
    scheme: DeLabScheme
    isConnected: boolean
    address: DeLabAddress
}

const textTg = { color: 'var(--tg-theme-text-color)' }
const wrapperTgStyles = { headerStyles: { background: 'var(--tg-theme-secondary-bg-color)' } }
const headerStyles = { header: { background: 'var(--tg-theme-secondary-bg-color)' } }

export const Layout: FC<LayoutProps> = ({ children, DeLabConnectObject, scheme, isConnected, address }) => (
    <PageWrapper
        className={s.wrapper}
        headerClassName={s.headerClass}
        containerWidth='500px'
        tgStyles={wrapperTgStyles}
        header={<>
            <HeaderPanel
                title=""
                containerWidth="440px"
                className={s.header}
                variant="black"
                tgStyles={headerStyles}
                actionLeft={
                    <Link to={ROUTES.HOME} className={s.logo}>
                        <Text fontSize="large" fontWeight="bold" color="#fff" tgStyles={textTg}>
                            Test App
                        </Text>
                    </Link>
                }
                actionRight={
                    <>
                        <Button
                            isConnected={isConnected}
                            DeLabConnector={DeLabConnectObject}
                            address={address}
                        />
                    </>
                }
            />
        </>}
        footer={<></>}
        content={<div className={s.content}>
            {children}
            <Modal DeLabConnectObject={DeLabConnectObject} scheme={'dark'} />
        </div>}
        pageTitle="Template Example"
    />
)
