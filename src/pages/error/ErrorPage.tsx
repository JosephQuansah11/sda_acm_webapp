import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
    const navigate = useNavigate();
    return (<>This page cannot be seen or found go back <Button onClick={()=>navigate(-1)}>Please Go Back</Button></>)
}