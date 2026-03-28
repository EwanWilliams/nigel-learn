

export default function ModuleCreation() {
  return (
    <div>
        <h1>Module Creation</h1>
        <p>This is where you can create new modules for your application.</p>

        <form onSubmit={null}>
            <label>
                Module Name:
                <input type="text" name="moduleName" />
            </label>
            <br></br>
            <br></br>
            <button type="submit">Create Module</button>
        </form>
    </div>
  );
}