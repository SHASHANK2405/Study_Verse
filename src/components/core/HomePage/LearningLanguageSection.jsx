import React from 'react'
import know_your_progress from "../../../assets/Images/Know_your_progress.png"
import compare_with_others from "../../../assets/Images/Compare_with_others.png"
import plan_your_lesson from "../../../assets/Images/Plan_your_lessons.png"
import HighlightText from "./HighlightText";
import CTAButton from "./Button"

const LearningLanguageSection = () => {
  return (
    <div className='mt-[130px] mb-32'>
      <div className='flex flex-col gap-5 items-center'>
        <div className='text-4xl font-semibold text-center'>
            Your Swiss Knife for
            <HighlightText text={"learning any language"}/>
        </div>
            
        <div className='text-center text-richblack-600 mx-auto text-base font-medium w-[70%]'>
            usig spin making learning multiple languages easy. with 20+ languages realistic voice-ever,
            progress tracking, custom schedule and more.
        </div>

        <div className='flex flex-row items-center justify-center mt-5'>
            <img src={know_your_progress} 
            alt="know_your_progress" 
            className='object-contain -mr-32'
            />
            <img src={compare_with_others} 
            alt="compare_with_others" 
            className='object-contain'
            />
            <img src={plan_your_lesson} 
            alt="plan_your_lesson" 
            className='object-contain -ml-36'
            />
        </div>

        <div className='w-fit'>
            <CTAButton active={true} linkto={"/signup"}>
                <div>
                    Learn more
                </div>
            </CTAButton>
        </div>
      </div>
    </div>
  )
}

export default LearningLanguageSection
