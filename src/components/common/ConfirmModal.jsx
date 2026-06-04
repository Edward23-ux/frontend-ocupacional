import Button from './Button.jsx'
import Modal from './Modal.jsx'
import Spinner from './Spinner.jsx'

export default function ConfirmModal({
  open,
  title = 'Confirmar acción',
  message = '¿Deseas continuar con esta acción?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? undefined : onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} icon={<Spinner size="small" visible={loading} />}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}