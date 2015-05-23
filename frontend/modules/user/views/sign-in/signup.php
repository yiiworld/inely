<?php
use yii\widgets\ActiveForm;

/* @var $this \yii\web\View */
?>

<div class="row">

    <div class="download-container">
        <h3 class="fadeInLeft animated"><?= Yii::t('frontend', 'Fast reg') ?></h3>

        <div class="buttons fadeInRight animated">
            <a href="" onclick="popupwindow('user/sign-in/oauth?authclient=vkontakte',
                    'Facebook', 600, 400); return false" class="icon-button vk">
                <i class="fa fa-vk"></i><span></span></a>
            <a href="" onclick="popupwindow('user/sign-in/oauth?authclient=facebook',
                    'Facebook', 660, 385); return false" class="icon-button facebook">
                <i class="fa fa-facebook"></i><span></span></a>
            <a href="" onclick="popupwindow('user/sign-in/oauth?authclient=google',
                    'Facebook', 400, 500); return false" class="icon-button google-plus">
                <i class="fa fa-google-plus"></i><span></span></a>
        </div>
    </div>

    <h3 class="fadeInLeft animated"><?= Yii::t('frontend', 'Reg') ?></h3>

    <div class="form-group fadeInLeft animated">
        <a class="login-a" href="#"><?= Yii::t('frontend', 'Already sign up?') ?></a>
    </div>

    <div class="col-lg-5" style="width: 100%">

        <?php \yii\widgets\Pjax::begin(['enablePushState' => false]) ?>
        <?php $form = ActiveForm::begin([
            'action' => '/sign-up',
            'options' => [
                'class' => 'subscription-form form-inline fadeInRight animated animated',
                'data-pjax' => true
            ],
        ]) ?>
        <?= $form->field($model, 'username', [
            'options' => [
                'class' => 'col-md-12',
            ],
        ])->textInput(['placeholder' => 'Ваше имя'])->label(false) ?>

        <?= $form->field($model, 'email', [
            'options' => [
                'class' => 'col-md-6',
            ],
        ])->textInput(['placeholder' => 'Email'])->label(false) ?>

        <?= $form->field($model, 'password', [
            'options' => [
                'class' => 'col-md-6',
            ],
        ])->passwordInput(['placeholder' => 'Пароль'])->label(false) ?>

        <?= \himiklab\yii2\recaptcha\ReCaptcha::widget([
            'name' => 'reCaptcha',
            'siteKey' => '6Lc4QgcTAAAAAEhGIBT4Fnqqj-NG8_VvbuBuA-ME',
            'widgetOptions' => ['class' => 'col-md-12']
        ]) ?>

        <div class="col-md-12">
            <div id="progress-button" class="progress-button">
                <button type="submit">
                    <span><?= Yii::t('frontend', 'Ok!') ?></span>
                </button>

                <svg class="progress-circle" width="70" height="70">
                    <path d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z"/>
                </svg>

                <svg class="checkmark" width="70" height="70">
                    <path d="m31.5,46.5l15.3,-23.2"/>
                    <path d="m31.5,46.5l-8.5,-7.1"/>
                </svg>

                <svg class="cross" width="70" height="70">
                    <path d="m35,35l-9.3,-9.3"/>
                    <path d="m35,35l9.3,9.3"/>
                    <path d="m35,35l-9.3,9.3"/>
                    <path d="m35,35l9.3,-9.3"/>
                </svg>

            </div>
        </div>
        <?php ActiveForm::end(); ?>
        <?php \yii\widgets\Pjax::end() ?>
    </div>
</div>

<script>
    [].slice.call( document.querySelectorAll( '.progress-button' ) ).forEach( function( bttn, pos ) {
        new UIProgressButton( bttn, {
            callback : function( instance ) {
                var progress = 0,
                    success = -1;
                    error = 1;
                    interval = setInterval( function() {
                        progress = Math.min( progress + 1, 1 );
                        instance.setProgress( progress );

                        if( progress === 1 ) {
                            if ($('form div').hasClass('has-error')) {
                                error = -1;
                                success = 1;
                                //alert('er');
                            } else {
                                error = 1;
                                success = -1;
                                //alert('suc');
                            }

                            instance.stop( pos === 1 || pos === 3 ? success : error );
                            clearInterval( interval );
                        }
                    }, 150 );
            }
        } );
    } );

    jQuery(function ($) {
        $('.login-a').click(function (ev) {
            ev.preventDefault();

            var url = 'login';

            $.get(url, function (html) {
                $('#myModal .modal-body').html(html);
                $('myModal').modal('show', {backdrop: 'static'});
            });
        });
    });
</script>