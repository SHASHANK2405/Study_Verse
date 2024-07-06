import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"
import { useNavigate } from 'react-router-dom'

export default function CoursesTable({courses , setCourses}) {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { token } = useSelector((state) => state.auth)
    const [loading, setLoading] = useState(false);
    const [confirmatioModal, setConfirmatioModal] = useState(false)

  return (
    <div>
      <Table>
        <Thead>
          <Tr className="flex gap-x-10 rounded-t-md border-b border-b-richblack-800 px-6 py-2">
            <Th className="flex-1 text-left text-sm font-medium uppercase text-richblack-100">
              Courses
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Duration
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Price
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {
            courses.length === 0 ? (
              <Tr>
                <Td>
                  No Courses Found
                </Td>
              </Tr>
            )
            :(
              courses?.map((course) => {
                <Tr>
                  
                </Tr>
              })
            )
          }
        </Tbody>
      </Table>
    </div>
  )
}
