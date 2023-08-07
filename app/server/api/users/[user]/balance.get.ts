import { Connection, PublicKey } from "@solana/web3.js";

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const connection = new Connection(config.privateRPC, "processed");
  const pubKey = event.context.params?.user;

  let publicKey: PublicKey;

  try {
    publicKey = new PublicKey(pubKey!);
  } catch (e) {
    return ErrorResponse.new(400, "Invalid public key", null);
  }

  const balance = await connection.getBalance(publicKey);

  return SuccessResponse.new<number>(200, "Operation was successful", balance);
});
