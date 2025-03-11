import { Args, PaginatedIndexerEventViews, Transaction } from "@roochnetwork/rooch-sdk";
import { MODULE_ADDRESS } from "../config/constants";
import { useCurrentAddress, useRoochClient, useSignAndExecuteTransaction } from "@roochnetwork/rooch-sdk-kit";
import { CheckInRaffle, CheckInRaffleRecord } from "../type";

export function Raffle(){
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const client = useRoochClient();
    const currentAddress = useCurrentAddress();


    const GetCheckInRaffleByFate = async () => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "raffle",
            function: "get_check_in_raffle_by_fate_v1",
            args: [],
        });
    
        const result = await signAndExecuteTransaction({ transaction: txn });
    
        const test = await client.queryEvents({
            filter: {
                tx_hash: result?.execution_info?.tx_hash,
            },
            queryOption: {
                decode: true,
            },
        });
    
        const filterCheckInRaffleEvents = (events: PaginatedIndexerEventViews) => {
            const targetEventType = `${MODULE_ADDRESS}::raffle::CheckInRaffleEmit`;
            return events.data.filter((event: { event_type: string; }) => event.event_type === targetEventType);
        };
    
        const filteredEvents = filterCheckInRaffleEvents(test);    
        return filteredEvents[0]?.decoded_event_data?.value.result;
    };

    const ClaimMaxRaffle = async () => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "raffle",
            function: "claim_max_raffle_v1",
            args: [],
        });
        const result = await signAndExecuteTransaction({ transaction: txn });
        console.log(result);
        
        return result;
    }


    const QueryCheckInRaffle = async(): Promise<CheckInRaffle> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "raffle",
            function: "query_check_in_raffle_view_v1",
            args: [],
        }) as any;
        console.log(result?.return_values[0]?.decoded_value?.value);
        return result?.return_values[0]?.decoded_value?.value;
    }

    const QueryCheckInRaffleRecord = async(): Promise<CheckInRaffleRecord> => {
        const address = currentAddress?.genRoochAddress().toHexAddress() || "";
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "raffle",
            function: "query_check_in_raffle_record_view_v1",
            args: [
                Args.address(address),
            ],
        }) as any;
        const recordData = result?.return_values[0]?.decoded_value?.value;
        console.log("当前抽奖次数:", recordData?.raffle_count || 0, "/50");
        return recordData;
    }

    return {
        GetCheckInRaffleByFate,
        ClaimMaxRaffle,
        QueryCheckInRaffle,
        QueryCheckInRaffleRecord,
    };
}