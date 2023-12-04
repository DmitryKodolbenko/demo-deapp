/* eslint-disable @typescript-eslint/no-dupe-class-members */
/* eslint-disable import/no-extraneous-dependencies */
import TonConnect, { WalletConnectionSource, WalletInfo, WalletInfoInjected, WalletInfoRemote } from '@tonconnect/sdk'
import EventEmitter from 'events'

import { Address } from 'ton'

import {
    DeLabNetwork,
    DeLabTypeConnect,
    DeLabAddress
} from '../types'

declare global {
    interface Window { ton: any; }
}

export class Connect {
    private _appUrl: string

    private _appName: string

    private _events = new EventEmitter()

    private _network: DeLabNetwork

    private _connectorTonConnect: TonConnect

    private _tonConnectWallets: Array<WalletInfo>

    private _tonConnectWallet: WalletInfo | undefined

    private _address: DeLabAddress

    private _balance: string | undefined

    private _typeConnect: DeLabTypeConnect

    private _isOpenModal: boolean = false

    constructor (
        appUrl: string,
        appName: string,
        network: DeLabNetwork = 'mainnet',
        manifestUrl: string = 'https://cloudflare-ipfs.com/ipfs/bafkreib7l74fuh7gmmmnwjoy3j4si74tdwgegw6gabuebfskolipuuia6i'
    ) {
        this._appUrl = appUrl
        this._appName = appName
        this._network = network

        // this._hostName = hostNameTonkeeper
        this._tonConnectWallets = []

        this._connectorTonConnect = new TonConnect({ manifestUrl })

        this._connectorTonConnect.restoreConnection()

        this._connectorTonConnect.onStatusChange(
            (walletInfo) => {
                console.log('walletInfo', walletInfo)
                if (this._connectorTonConnect.connected && walletInfo) {
                    this._address =  Address.parseRaw(
                        walletInfo.account.address
                    ).toFriendly()
                    this._typeConnect = 'tonkeeper'

                    Connect.addStorageData('init',  true)
                    Connect.addStorageData('type-connect',  this._typeConnect)
                    Connect.addStorageData('address',  this._address)
                    Connect.addStorageData('network',  this._network)

                    this.sussesConnect()
                    this.closeModal()
                }
            }
        )

        if (window.ton) {
            if (window.ton.isTonWallet) {
                window.ton.on('accountsChanged', (wallet: any) => {
                    if (!wallet) {
                        return
                    }
                    if (wallet.length === 0) {
                        return
                    }

                    this._address =  Address.parseRaw(
                        wallet[0]
                    ).toFriendly()
                    this._typeConnect = 'toncoinwallet'

                    Connect.addStorageData('init',  true)
                    Connect.addStorageData('type-connect',  this._typeConnect)
                    Connect.addStorageData('address',  this._address)
                    Connect.addStorageData('network',  this._network)

                    this.sussesConnect()
                    this.closeModal()
                })
            }
        }

        this.loadWallet()

        console.log('v: 1.4.4')
    }

    public loadWallet (): void {
        if (Connect.getStorageData('init')) {
            const typeConnect = Connect.getStorageData('type-connect')
            switch (typeConnect) {
                case 'toncoinwallet':

                    this._address = Connect.getStorageData('address')
                    this._typeConnect = 'toncoinwallet'

                    this.connectToncoinWallet()
                    break

                case 'tonkeeper':
                    this._address = Connect.getStorageData('address')
                    this._typeConnect = 'tonkeeper'

                    this.sussesConnect()
                    break
                default:
                    break
            }
        }
    }

    private newEvent (name: string, data: any): void {
        this._events.emit(
            name,
            { data }
        )
    }

    private static addStorageData (key: string, value: any): void {
        localStorage.setItem('delab-' + key,  JSON.stringify(value))
    }

    private static getStorageData (key: string): any {
        try {
            return JSON.parse(localStorage.getItem('delab-' + key) ?? '')
        } catch (error) {
            return localStorage['delab-' + key]
        }
    }

    private static delStorageData (key: string): void {
        localStorage.removeItem('delab-' + key)
    }

    private clearStorage (): void {
        switch (this._typeConnect) {
            case 'toncoinwallet':
            case 'tonkeeper':
                Connect.delStorageData('init')
                Connect.delStorageData('type-connect')
                Connect.delStorageData('address')
                Connect.delStorageData('network')
                break

            default:
                break
        }
    }

    public async createTonConnect (): Promise<void> {
        const walletsList = await this._connectorTonConnect.getWallets()
        this._tonConnectWallets = walletsList

        const tonkeeperKey: any = walletsList[0]

        if (tonkeeperKey.embedded) {
            console.log('embedded', tonkeeperKey.jsBridgeKey)
            this._connectorTonConnect.connect(
                { jsBridgeKey: tonkeeperKey.jsBridgeKey }
            )
        }
        console.log(this._tonConnectWallets)
    }

    private sussesConnect () {
        const sendData: any = {
            address: this._address,
            network: this._network,
            typeConnect: this._typeConnect,
            autosave: true
        }
        this.newEvent('connect', sendData)
    }

    public async connectToncoinWallet (): Promise<DeLabAddress> {
        if (window.ton) {
            if (window.ton.isTonWallet) {
                console.log(window.ton)

                const address = await window.ton.send('ton_requestAccounts')
                console.log(address)
                if (address) {
                    if (address.length > 0) {
                        if (address[0]) {
                            console.log(address[0])

                            this._address = address[0]
                            this._typeConnect = 'toncoinwallet'

                            this.sussesConnect()

                            Connect.addStorageData('init',  true)
                            Connect.addStorageData('type-connect',  this._typeConnect)
                            Connect.addStorageData('address',  this._address)
                            Connect.addStorageData('network',  this._network)
                            this.closeModal()
                            return this._address
                        }
                    }
                }

                this.newEvent('error-toncoinwallet', 'account_not_registered')
            } else {
                this.newEvent('error-toncoinwallet', 'error_isTonWallet')
            }
        } else {
            this.newEvent('error-toncoinwallet', 'toncoin_wallet_not_installed')
        }
        return undefined
    }

    public async connectTonkeeper
    (wallet: WalletInfo): Promise<DeLabAddress> {
        let walletConnectionSource: WalletConnectionSource
        if ((<WalletInfoRemote>wallet).universalLink) {
            walletConnectionSource = {
                universalLink: (<WalletInfoRemote>wallet).universalLink,
                bridgeUrl: (<WalletInfoRemote>wallet).bridgeUrl
            }
        } else {
            walletConnectionSource = { jsBridgeKey: (<WalletInfoInjected>wallet).jsBridgeKey }
        }

        const universalLink = this._connectorTonConnect.connect(
            walletConnectionSource
        )
        // console.log(universalLink)

        this._tonConnectWallet = wallet

        if (universalLink) this.newEvent('link', universalLink)
        return undefined
    }

    public on (event: string, listener: EventListener): void {
        this._events.on(event, listener)
    }

    public disconnect (): boolean {
        this._address = undefined
        this._balance = undefined

        this._connectorTonConnect.disconnect()

        this.clearStorage()

        this.newEvent('disconnect', true)
        return true
    }

    public closeModal (): boolean {
        this._isOpenModal = false

        this.newEvent('modal', this._isOpenModal)
        return true
    }

    public async openModal (): Promise<boolean> {
        this._isOpenModal = true
        // this.newEvent('modal', this._isOpenModal)
        await this.createTonConnect()
        this.newEvent('modal', this._isOpenModal)

        return true
    }

    public get isOpenModal (): boolean {
        return this._isOpenModal
    }

    public get typeConnect (): string | undefined {
        return this._typeConnect
    }

    public get appUrl (): string {
        return this._appUrl
    }

    public get appName (): string {
        return this._appName
    }

    public get address (): string | undefined {
        return this._address
    }

    public get network (): DeLabNetwork {
        return this._network
    }

    public get tonConnectWallets (): Array<WalletInfo> | undefined {
        return this._tonConnectWallets
    }

    public get connectorTonConnect (): TonConnect | undefined {
        return this._connectorTonConnect
    }

    public get tonConnectWallet (): WalletInfo | undefined {
        return this._tonConnectWallet
    }
}
