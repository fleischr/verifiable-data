const {
  createdConditions,
  ISSUED_ON,
  createCredential,
  signCredential,
  writeResult,
} = require("./date-utils");
const folderName = "suiteConstructor";

createdConditions.forEach(async (createdDate, index) => {
  const credential = createCredential(ISSUED_ON);
  const { suite, suiteError } = await createSuite(createdDate);
  if (suiteError) {
    return writeResult(folderName, index, suiteError);
  }
  const { signedCredential, signedError } = await signCredential(
    suite,
    credential
  );
  if (signedError) {
    return writeResult(folderName, index, signedError);
  }
  return writeResult(folderName, index, signedCredential);
});
