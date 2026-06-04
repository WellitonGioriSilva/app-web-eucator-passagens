START TRANSACTION;

  SET @payment_id = 1;

  UPDATE payments
  SET
    status = 'finalizado',
    dataHoraPagamento = NOW()
  WHERE id = @payment_id;

  UPDATE sales s
  INNER JOIN payments p ON p.saleId = s.id
  SET s.status = 'finalizada'
  WHERE p.id = @payment_id;

  UPDATE tickets t
  INNER JOIN payments p ON p.saleId = t.saleId
  SET
    t.status = 'vendido',
    t.reservationExpiresAt = NULL
  WHERE p.id = @payment_id;

COMMIT;

