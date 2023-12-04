import { FC } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import { Link } from 'react-router-dom'

import { HeaderPanel, PageWrapper, Text } from '@delab-team/de-ui'

import { ROUTES } from '../utils/router'

import s from './layout.module.scss'

interface LayoutProps {
    children: React.ReactNode;
}

const textTg = { color: 'var(--tg-theme-text-color)' }
const wrapperTgStyles = { headerStyles: { background: 'var(--tg-theme-secondary-bg-color)' } }
const headerStyles = { header: { background: 'var(--tg-theme-secondary-bg-color)' } }

export const Layout: FC<LayoutProps> = ({ children }) => (
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
                            Template Logo
                        </Text>
                    </Link>
                }
                actionRight={
                    <>
                        <TonConnectButton />
                    </>
                }
            />
        </>}
        footer={<></>}
        content={<div className={s.content}>{children}</div>}
        pageTitle="Template Example"
    />
)
