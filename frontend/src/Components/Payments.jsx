import { useEffect, useState } from "react";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with API call later
    setTimeout(() => {
      setPayments([
        {
          id: 1,
          user: "John Doe",
          amount: 1200,
          status: "Completed",
          date: "2024-01-15",
        },
        {
          id: 2,
          user: "Jane Smith",
          amount: 850,
          status: "Pending",
          date: "2024-01-14",
        },
        {
          id: 3,
          user: "Bob Johnson",
          amount: 2000,
          status: "Completed",
          date: "2024-01-13",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <p>Loading payments...</p>;

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1>Payments Management</h1>
        <button className="primary-btn">+ Process Payment</button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.user}</td>
                <td>₵{payment.amount}</td>
                <td>
                  <span className={`status ${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </td>
                <td>{payment.date}</td>
                <td className="actions">
                  <button className="view">View</button>
                  <button className="edit">Refund</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && <p>No payments found</p>}
      </div>
    </div>
  );
};

export default Payments;
