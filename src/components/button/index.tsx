/* eslint-disable import/no-extraneous-dependencies */
import { memo } from 'react'
import { IoExitOutline } from 'react-icons/io5'

import { Connect } from '../../logic/connect'

import { DeLabAddress } from '../../types'

import s from './button.module.scss'

interface ButtonProps {
    isConnected: boolean
    DeLabConnector: Connect
    address: DeLabAddress
}

export const Button = memo(
    (props: ButtonProps) => (
        <>
            {!props.isConnected ? (
                <button className={s.connectBtn} onClick={() => props.DeLabConnector.openModal()}>
                  Connect
                </button>
            ) : (
                <button className={s.connectBtn} onClick={() => props.DeLabConnector.disconnect()}>
                    {props.address && props.address.substr(0, 5)}...${props.address?.substr(props.address?.length - 5, props.address?.length)} {' '} <IoExitOutline />
                </button>
            )}
        </>
    )
)
