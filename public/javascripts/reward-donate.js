$(document).ready(function () {
  $('.js-reward-form').on('submit', function (e) {
    e.preventDefault();

    const rewardForm = $(e.currentTarget);
    const rewardId = rewardForm.data('reward');

    $.ajax({
      url: rewardForm.attr('action'),
      type: 'POST',
      data: { amount: rewardForm.find('#pledge-amount')[0].value },
      xhrFields: {
        withCredentials: true
      },
      success: displaySuccess,
      error: displayError
    });

    function displaySuccess(reward) {
      let theReward = $(`.reward-wrapper[data-reward=${reward._id}]`)[0];
      let rewardContents = $(`.reward-wrapper[data-reward=${reward._id}] form`)

      rewardContents.fadeOut(2000, () => {
        $(theReward).children('.reward-success').show()
      });
    }

    function displayError(err) {
      console.log(err);
    }
  });
});

