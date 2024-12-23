import { TransactionStatus } from "src/psp/enums/TransactionStatus";

export class TransactionStatusDetails {
    static getMessage(status: TransactionStatus): string {
        switch (status) {
            case TransactionStatus.INITIATED:
                return 'The transaction has been created but not sent to PSP.';
            case TransactionStatus.SENT:
                return 'The transaction sent to PSP and awaits a response.';
            case TransactionStatus.GET_LINK:
                return 'Start process to get link.';
            case TransactionStatus.GET_LINK_ERROR:
                return 'Process to get merchant link has error.';
            case TransactionStatus.GET_LINK_SUCCESS:
                return 'Process to get merchant link was successful.';
            case TransactionStatus.OPENED:
                return 'The transaction received response from PSP.';
            case TransactionStatus.PENDING:
                return 'Pending result of transaction.';
            case TransactionStatus.AUTHENTICATION_START:
                return 'Start authentication process with PSP.';
            case TransactionStatus.AUTHENTICATION_APPROVED:
                return 'Approved transaction process.';
            case TransactionStatus.AUTHENTICATION_ERROR:
                return 'Authentication process has error.';
            case TransactionStatus.RESULT_RECEIVED:
                return 'The transaction result received as true.';
            case TransactionStatus.PROCESSING_FAILED:
                return 'The transaction result received.';
            case TransactionStatus.REJECT:
                return 'Cancel or reject transaction.';
            case TransactionStatus.ERROR:
                return 'Transaction has error.';
            case TransactionStatus.SUCCESS:
                return 'Transaction success.';
            case TransactionStatus.COMPLETE:
                return 'Complete transaction.';
            case TransactionStatus.CHECK_USER_EXISTS:
                return 'Check the user in the database.';
            case TransactionStatus.USER_CREATE_EXTERNAL_START:
                return 'Create current user in the external system.';
            case TransactionStatus.USER_CREATE_EXTERNAL_END:
                return 'Create current user in the external system.';
            case TransactionStatus.USER_CREATE_EXTERNAL_FAILED:
                return 'Create current user in the external system failed.';
            case TransactionStatus.GET_USER_KYC_START:
                return 'Get the user KYC through Bractagon API.';
            case TransactionStatus.GET_USER_KYC_END:
                return 'Get the user KYC through Bractagon finished.';
            case TransactionStatus.USER_KYC_UPLOAD_START:
                return 'Start uploading user KYC to the external service.';
            case TransactionStatus.USER_KYC_UPLOAD_END:
                return 'End process of uploading document on external service.';
            case TransactionStatus.USER_KYC_UPLOAD_FAILED:
                return 'Failed process uploading KYC document in external service.';
            case TransactionStatus.CHECK_USER_ERROR:
                return 'Check the user in database error.';
            default:
                return 'Unknown transaction status.';
        }
    }
}
