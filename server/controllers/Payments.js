const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const {courseEnrollmentEmail} = require("../mail/temp/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const mailSender = require("../utils/mailSender");

//capture the payment and initiate the razorpay order
exports.capturePayment = async (req ,res) => {
    //get coursseId and UserId 
    const {course_id} =req.body;
    const userId = req.user.id;
    //validation
    //valid courseId
    if(!course_id) {
        return res.json({
            success: false,
            message: 'Please provide valid course ID',
        })
    }
    //valid courseDetails
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course) {
            return res.json({
                success:false,
                message:'Could not find the course'
            });
        }

        //user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentEnrolled.includes(uid)) {
            return res.status(200).json({
                success:false,
                message:'Student is already Enrooled',
            });
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    
    //order create
    const amount = course.price;
    const currency = 'INR';

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    };

    try{
        //initiate the payment using the razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        //return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
    }catch(error){
        console.log(error);
        res.json({
            success: false,
            message: "Could not initiate order",
        });
    }
};

//verify Signature of Razorpay and server

exports.verifySignature = async(req , res) => {
    const webhookSecret = "12345678";

    const signature = req.headers("x-razorpay-signature");

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest) {
        console.log("Payment is Authorized"); 

        const {courseId , userId} = req.body.payload.payment.entity.notes;

        try{
            // fullfill the action
            //find the course and enrolled the student in it 
            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id: courseId},
                                            {$push:{studentEnrolled: userId}},
                                            {new:true},
                                        )
            if(!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:'Course not found',
                });
            }

            console.log(enrolledCourse);

            //find the student and add the course to their enrolled list
            const enrolledStudent = await User.findOneAndUpdate(
                                            {_id:userId},
                                            {$push:{courses:courseId}},
                                            {new:true},
                                        );
            console.log(enrolledStudent);

            //mail send of confirmation
            const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                        "Congratulation from PadhaiKarlo",
                                        "Congratulation, you are onboarded to new course",
                                    );
            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message: "Signature Verified and course added",
            });
        }catch(error){
            console.log(error)
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        })
    }
}


// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnroled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}