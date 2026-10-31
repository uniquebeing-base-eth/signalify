import { listEmployees } from "@/lib/agent-factory";

export default async function EmployeesPage() {
  const employees = await listEmployees();

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">AI workforce</p>
          <h1>Employee roster</h1>
        </div>
      </div>

      <div className="panel wide-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Profession</th>
              <th>Employee ID</th>
              <th>Model</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee: any) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.profession}</td>
                <td>{employee.employeeId}</td>
                <td>{employee.modelName}</td>
                <td><span className="status-pill">{employee.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
