const { useState, useEffect } = React;
const { near } = window;

near.config({ networkId: "mainnet" });

const contractId = "social.near";
const graphId = "connect";
const connections = [];

const Join = () => {
  const [nonce, setNonce] = useState(0);
  const [accountId, setAccountId] = useState("hack.near");
  const [profile, setProfile] = useState(null);
  const [groupId, setGroupId] = useState('connect')
  const type = 'group';
  
  useEffect(() => {
    near.onAccount((accountId) => {
      console.log("Account ID Update", accountId);
      setAccountId(accountId);
      setNonce((nonce) => nonce + 1);
    });
    near.onTx((txStatus) => {
      console.log("Tx Status Update", txStatus);
      setNonce((nonce) => nonce + 1);
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accountId) return;
      
      try {
        const profile = await near.view({
          contractId: "social.near",
          methodName: "get",
          args: {
            keys: [`${accountId}/profile/**`]
          },
        });
        setProfile(profile);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, [accountId, nonce]);

  useEffect(() => {
    (async () => {
      list(
        await near.view({
          contractId,
          methodName: "get",
          args: {},
        }),
      );
      join(
        near.accountId
          ? await near.view({
              contractId,
              methodName: "set",
              args: {
                account_id: near.accountId,
              },
            })
          : null,
      );
    })();

  return (
    <div className="container-fluid">
    {near.accountId ? (
      <div key="sign-out">
        <h1>Logged in as {near.accountId}</h1>
        <div>Pubkey is {near.publicKey}</div>
        <div>
          Auth:
          <br />
          <pre>{JSON.stringify(near.authStatus, null, 2)}</pre>
        </div>
        <button
          className="btn btn-secondary m-1"
          onClick={() => near.signOut()}
        >
          Sign Out
        </button>
      </div>
    ) : (
      <div key="sign-in">
        <button
          className="btn btn-primary m-1"
          onClick={() => near.requestSignIn({ contractId })}
        >
          Sign In
        </button>
      </div>
    )}
    <div>
      Profile: {near.account.profile.name}
    </div>
    {near.accountId && (
      <div>
        Your Near Social Data:{" "}
        {near.account.profile}
      </div>
    )}
    <button
      className="btn btn-primary btn-lg m-1"
      onClick={() => {
        near
          .sendTx({
            receiverId: contractId,
            actions: [
              near.actions.functionCall({
                methodName: "get",
                gas: `100 Tgas`,
                deposit: `0.0 NEAR`,
                args: {
                    keys: [`${near.accountId}/profile/**`]
                },
              }),
            ],
          })
          .then((txId) => {
            console.log("Sent", txId);
          })
          .catch((err) => {
            console.error("Failed to send", err);
          });
      }}
    >
      Join
    </button>

    <button
      className="btn btn-success m-1"
      onClick={() => {
        near
          .sendTx({
            receiverId: contractId,
            actions: [
              near.actions.functionCall({
                methodName: "set",
                gas: $$`200 Tgas`,
                deposit: "0.0 NEAR",
                args: {
                    data: {
                      graph: { 
                        connect: { 
                          [near.accountId]: "" 
                        } 
                      },
                      index: {
                        graph: JSON.stringify({
                          key: "connect",
                          value: {
                            type,
                            accountId: near.accountId,
                          },
                        }),
                        notify: JSON.stringify({
                          key: near.accountId,
                          value: {
                            type,
                            accountId: near.accountId,
                            message: "Let's collab!",
                          },
                        }),
                      },
                    }
                  },
              }),
            ],
          })
          .then((txId) => {
            console.log("Joined", txId);
          })
          .catch((err) => {
            console.error("Failed", err);
          });
      }}
    >
      Join
    </button>

    <div
      className="mw-100 d-flex align-items-stretch flex-column align-content-stretch"
      style={{ 
        width: "420px",
        height: "420px",
        maxWidth: "100%",
        maxHeight: "100vw"
      }}
    >
      {connections.map((graphId, i) => (
        <div key={i} className="line">
          {loadGraph(graphId)}
        </div>
      ))}
    </div>
  </div>
  );

});

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Join />)};