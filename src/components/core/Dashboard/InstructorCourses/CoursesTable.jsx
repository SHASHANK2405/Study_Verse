import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function CoursesTable({courses , setCourses}) {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { token } = useSelector((state) => state.auth)
    const [loading, setLoading] = useState(false);
    const [confirmatioModal, setConfirmatioModal] = useState(false)

  return (
    <div>
      
    </div>
  )
}
