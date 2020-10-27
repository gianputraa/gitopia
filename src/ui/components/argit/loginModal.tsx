import * as React from "react"
import Dropzone from "react-dropzone"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import { connector } from "../../actionCreators/index"
import { arweave } from "../../../index"

export const LoginModal = connector(
  state => ({
    keyFileName: state.argit.keyFileName,
    openedLoginModal: state.argit.openedLoginModal,
    wallet: state.argit.wallet
  }),
  actions => ({
    openLoginModal: actions.argit.openLoginModal,
    closeLoginModal: actions.argit.closeLoginModal,
    loadKeyFile: actions.argit.loadKeyFile,
    setIsAuthenticated: actions.argit.setIsAuthenticated,
    setWallet: actions.argit.setWallet
  })
)(function LoginModalImpl(props) {
  return (
    <Modal isOpen={props.openedLoginModal} toggle={props.closeLoginModal}>
      <ModalHeader toggle={props.closeLoginModal}>Login</ModalHeader>
      <ModalBody>
        <Dropzone
          onDrop={async acceptedFiles => {
            if (
              acceptedFiles[0].name
                .split(".")
                .pop()
                .toLowerCase() === "json"
            ) {
              const upload = acceptedFiles[0] // Get uploaded file
              let keyFileName =
                upload.name.length > 15
                  ? upload.name.substring(0, 10) + "....json"
                  : upload.name // Concatenate filename for dropzone

              props.loadKeyFile({ keyFileName })

              const reader = new FileReader() // Initiate FileReader
              reader.readAsText(upload) // Read content as text

              reader.onload = () => {
                const keyfile = JSON.parse(String(reader.result)) // Parse text to JSON object

                if (keyfile.kty === "RSA") {
                  // Confirm that uploaded file is indeed keyfile
                  props.setWallet({ wallet: String(reader.result) })
                  //   this.toggleModal() // Close login modal
                  props.closeLoginModal({})
                  props.setIsAuthenticated({ isAuthenticated: true })

                  console.log(props.wallet)
                  arweave.wallets.jwkToAddress(keyfile).then(address => {
                    window.location.replace(`/#/${address}`)
                    props.closeLoginModal({})
                  })

                  // window.location.reload() // Reload page to get authenticated status
                } else {
                  props.loadKeyFile({ keyFileName: "Error: Not a keyfile" })
                }
              }
            } else {
              props.loadKeyFile({ keyFileName: "Error: Not a keyfile" })
            }

            props.closeLoginModal({})
          }}
        >
          Drop your Arweave wallet keyfile here or Click here
        </Dropzone>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={props.closeLoginModal}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
})
