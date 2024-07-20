import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import { useSelector } from "react-redux";
import ReactStars from "react-rating-stars-component";
import { createRating } from "../../../services/operations/courseDetailsAPI";
import IconBtn from "../../common/IconBtn";

const CourseReviewModal = ({ setReviewModal }) => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { courseEntireData } = useSelector((state) => state.viewCourse);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue("courseExperience", "");
    setValue("courseRating", 0);
  }, []);

  const ratingChange = (newRating) => {
    setValue("courseRating", newRating);
  };
  const onSubmit = async (data) => {
    await createRating(
      {
        courseId: courseEntireData._id,
        rating: data.courseRating,
        review: data.courseExperience,
      },
      token
    );
    setReviewModal(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* modal header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">Add Review</p>
          <button
            onClick={() => setReviewModal(false)}
            className="text-2xl text-richblack-5"
          >
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        {/* body modal */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-x-4">
            <img
              src={user?.image}
              alt={user?.firstName + "Profile"}
              className="aspect-square w-[50px] rounded-full object-cover"
            />
            <div className="">
              <p className="font-semibold text-richblack-5">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-5">Posting Publicly</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col items-center"
          >
            <ReactStars
              count={5}
              onChange={ratingChange}
              activeColor="#ffd700"
              size={24}
            />

            <div className="flex w-11/12 flex-col space-y-2">
              <label
                htmlFor="courseExperience"
                className="text-sm text-richblack-5"
              >
                Add your Experience <sup className="text-pink-200">*</sup>
              </label>
              <textarea
                id="courseExperience"
                placeholder="Write Your Experience Here"
                className="form-style resize-x-none min-h-[130px] w-full"
                {...register("courseExperience", { required: true })}
              />
              {errors.courseExperience && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  Please add your experience
                </span>
              )}
            </div>

            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              {/* cancel and save button */}
              <button
                onClick={() => setReviewModal(false)}
                className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
              >
                Cancel
              </button>
              <IconBtn text="save" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseReviewModal;