import { TypeCoinBuy } from "../enums/typeCoinBuy";

// Attribute DTOs
export class DestinationDto {
    address_type: string | null;
    address: string;
}

export class AttributesDto {
    address: string;
    created_at: string;
    tracking_id: string;
    target_paid: string;
    destination: DestinationDto;
}

export class CurrencyAttributesDto {
    iso: number;
    name: string;
    alpha: string;
    alias: string | null;
    exp: number;
    confirmation_blocks: number;
    minimal_transfer_amount: string;
    block_delay: number;
}

export class TransferAttributesDto {
    op_id: number;
    op_type: number;
    amount: string;
    commission: string;
    fee: string;
    txid: string;
    status: number;
    user_message: string | null;
    created_at: string;
    updated_at: string;
    confirmations: number;
    risk: number;
    risk_status: number;
    amount_cleared: string;
}

// Relationship DTOs
export class CurrencyRelationshipDto {
    data: { type: string; id: string };
}

export class WalletRelationshipDto {
    data: { type: string; id: string };
}

export class TransferRelationshipDto {
    data: { type: string; id: string };
}

export class RelationshipsDto {
    currency: CurrencyRelationshipDto;
    wallet: WalletRelationshipDto;
    transfer: TransferRelationshipDto;
}

// Main Data DTO
export class DataDto {
    type: string;
    id: string;
    attributes: AttributesDto;
    relationships: RelationshipsDto;
}

// Included DTO
export class IncludedCurrencyDto {
    type: TypeCoinBuy.CURRENCY;
    id: string;
    attributes: CurrencyAttributesDto;
}

export class IncludedTransferDto {
    type: TypeCoinBuy.TRANSFER;
    id: string;
    attributes: TransferAttributesDto;
    relationships: { currency: CurrencyRelationshipDto };
}

// Meta DTO
export class MetaDto {
    time: string;
    sign: string;
}

// Main DTO
export class CoinBuyCallbackTransactionDto {
    data: DataDto;
    included: (IncludedCurrencyDto | IncludedTransferDto)[];
    meta: MetaDto;
}

