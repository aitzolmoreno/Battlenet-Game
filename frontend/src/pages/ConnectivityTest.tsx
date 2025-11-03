import { useState } from "react";

function Test() {
    const [data, setData] = useState("Check backend connectivity");

    function check(){
        fetch(`http://localhost:8080/api/test`)
        .then(res => res.text())
        .then(resData => {
            console.log("Backend response:", resData);
            setData("Backend response: " + resData);
        })
        .catch(err => {
            console.error("Error connecting to backend:", err);
            setData("Error connecting to backend");
        });
    }


    return (
        <>
            <h1>Test</h1>
            <button onClick={check}>Check connectivity with the backend</button>
            <p>{data}</p>
        </>
    )
}

export default Test