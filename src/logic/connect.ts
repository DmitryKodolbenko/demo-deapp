/* eslint-disable max-len */
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

        const localwallets = [
            {
                name: 'DeWallet',
                // appName:"telegram-wallet",
                appName: 'dewallet',
                imageUrl: 'https://wallet.tg/images/logo-288.png',
                aboutUrl: 'https://wallet.tg/',
                platforms: [ 'ios', 'android', 'macos', 'windows', 'linux' ],
                bridgeUrl: 'https://bridge.tonapi.io/bridge',
                universalLink: 'https://v2.delabwallet.com/tonconnect'

                // --AA--22--AA--7B--AA--5C--AA--22manifestUrl--AA--5C--AA--22--AA--3A--AA--5C--AA--22https--AA--3A--AA--2F--AA--2Fcloudflare-ipfs--BB--com--AA--2Fipfs--AA--2Fbafkreib7l74fuh7gmmmnwjoy3j4si74tdwgegw6gabuebfskolipuuia6i--AA--5C--AA--22--AA--2C--AA--5C--AA--22items--AA--5C--AA--22--AA--3A--AA--5B--AA--7B--AA--5C--AA--22name--AA--5C--AA--22--AA--3A--AA--5C--AA--22ton_addr--AA--5C--AA--22--AA--7D--AA--5D--AA--7D--AA--22-

                // --AA--22--AA--7B--AA--5C--AA--22manifestUrl--AA--5C--AA--22--AA--3A--AA--5C--AA--22https--AA--3A--AA--2F--AA--2Fcloudflare-ipfs--BB--com--AA--2Fipfs--AA--2Fbafkreib7l74fuh7gmmmnwjoy3j4si74tdwgegw6gabuebfskolipuuia6i--AA--5C--AA--22--AA--2C--AA--5C--AA--22items--AA--5C--AA--22--AA--3A--AA--5B--AA--7B--AA--5C--AA--22name--AA--5C--AA--22--AA--3A--AA--5C--AA--22ton_addr--AA--5C--AA--22--AA--7D--AA--5D--AA--7D--AA--22

                // 'https://v2.delabwallet.com/'

                // 'https://t.me/delabtonbot/wallet?startapp'
                // https://t.me/delabtonbot/donate?startapp=EQC7tMMk77bZJiR5PzS4gAQAodnqRbK1vbOlVGOnv4BMK3e_
                // https://t.me/wallet?attach=wallet

                // tg://resolve?domain=delabtonbot&appname=wallet&startapp=tonconnect-v__2-id__e0caeac8303c2c82406d60ea51a949622503025f05619a249df9989744d7f779-r__--manifestUrl--%26quot%3Bhttps%3A%2F%2Fcloudflare-ipfs.com%2Fipfs%2Fbafkreib7l74fuh7gmmmnwjoy3j4si74tdwgegw6gabuebfskolipuuia6i%26quot%3B--items--%5B%7B%26quot%3Bname%26quot%3B%3A%26quot%3Bton_addr%26quot%3B%7D%5D-/

                // tg://resolve?domain=delabtonbot&appname=wallet&startapp=tonconnect-v__2-id__76b9c5a63a63aaa177ff4f703264d04312366df7667acc9ef72b5d18414eca2f-r__--7B----22--manifestUrl--22--%3A--22--https%3A%2F%2Fcloudflare-ipfs.com%2Fipfs%2Fbafkreib7l74fuh7gmmmnwjoy3j4si74tdwgegw6gabuebfskolipuuia6i--22--%2C--22--items--22--%3A--5B----7B----22--name--22--%3A--22--ton_addr--22----7D----5D----7D---/

                // tg://resolve?domain=wallet&appname=start&startapp=tonconnect-v__2-id__4915842b79cc8e77e8ad3b2b22e2d1df09ed264e77e6227f7eb7a07146e5b551-r__--7B--22manifestUrl--22--3A--22https--3A--2F--2Fdedust--2Eio--2Fapi--2Ftonconnect--2Dmanifest--22--2C--22items--22--3A--5B--7B--22name--22--3A--22ton--5Faddr--22--7D--5D--7D-ret__none/

                // eslint-disable-next-line max-len
                // https://t.me/wallet?attach=wallet&startattach=tonconnect-v__2-id__7d27c318642a58a71e6de16085c5f22567dceff099d4c943c99faa6727aa137e-r__--7B--22manifestUrl--22--3A--22https--3A--2F--2Fcloudflare--2Dipfs--2Ecom--2Fipfs--2Fbafkreib7l74fuh7gmmmnwjoy3j4si74tdwgegw6gabuebfskolipuuia6i--22--2C--22items--22--3A--5B--7B--22name--22--3A--22ton--5Faddr--22--7D--5D--7D
            } ] as WalletInfo[]

        // https://t.me/delabtonbot/donate?startapp=EQC7tMMk77bZJiR5PzS4gAQAodnqRbK1vbOlVGOnv4BMK3e_
        this._tonConnectWallets = localwallets

        const tonkeeperKey: any = walletsList[0]

        if (tonkeeperKey.embedded) {
            console.log('embedded', tonkeeperKey.jsBridgeKey)
            this._connectorTonConnect.connect(
                { jsBridgeKey: tonkeeperKey.jsBridgeKey }
            )
        }
        console.log(JSON.stringify(this._tonConnectWallets))
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
