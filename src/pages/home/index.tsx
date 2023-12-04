/* eslint-disable consistent-return */
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { FC, useState } from 'react'
import { toNano } from 'ton-core'

import s from './home.module.scss'

interface HomeProps {}

type FormDataType = {
    address: string
    quantity: string
}

const DEFAULT_FORM_DATA = {
    address: '',
    quantity: ''
}

export const Home: FC<HomeProps> = () => {
    const [ formData, setFormData ] = useState<FormDataType>({
        address: '',
        quantity: ''
    })

    const [ tonConnectUI ] = useTonConnectUI()
    const rawAddress = useTonAddress()
    const [ error, setError ] = useState<string | null>(null)

    const handleSendTransaction = async () => {
        setError(null)

        if (!rawAddress) {
            setError('Please connect wallet to send the transaction!')
            return
        }

        if (!formData.address || !formData.quantity) {
            setError('Please fill in both address and quantity fields.')
            return
        }

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
            messages: [
                {
                    address: formData.address,
                    amount: toNano(formData.quantity).toString()
                }
            ]
        }

        try {
            const tx = await tonConnectUI.sendTransaction(transaction)
            console.log('🚀 ~ file: index.tsx:34 ~ handleSendTransaction ~ tx:', tx)

            setFormData(DEFAULT_FORM_DATA)
            return tx
        } catch (e) {
            setError('Unknown error happened')
        }
    }

    return (
        <div className={s.formContainer}>
            <label className={s.label}>
                Address:
                <input
                    className={s.inputField}
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
            </label>
            <br />
            <label className={s.label}>
                Quantity:
                <input
                    className={s.inputField}
                    type="text"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                />
            </label>
            <br />
            <button className={s.button} onClick={handleSendTransaction}>
                Send
            </button>
            {error && <div className={s.error}>{error}</div>}
        </div>
    )
}
