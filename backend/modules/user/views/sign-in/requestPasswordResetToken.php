<?php
    use yii\widgets\ActiveForm;

    $this->registerJsFile('@web/js/landing/uiProgressButton.js', ['position' => yii\web\View::POS_BEGIN]);
?>

<div class="row">
    <h4 class="bounceIn animated"><?= Yii::t('frontend',
            'Please enter your e-mail. It will receive a letter with instructions to reset your password.') ?></h4>

    <div class="form-group bounceIn animated">
        <a class="forget-a" href="#"><?= Yii::t('frontend', 'Nope') ?></a>
    </div>

    <div class="col-lg-5" style="width: 100%">

        <?php \yii\widgets\Pjax::begin(['enablePushState' => false]) ?>
        <?php $form = ActiveForm::begin([
            'id' => 'reset-form',
            'action' => 'reset',
            'options' => [
                'class' => 'subscription-form form-inline bounceIn animated',
                'data-pjax' => true
            ],
        ]); ?>
        <?= $form->field($model, 'email', [
            'options' => [
                'class' => 'col-md-12',
            ],
        ])->textInput(['placeholder' => 'Email'])->label(false) ?>
        <?php ActiveForm::end(); ?>
        <?php \yii\widgets\Pjax::end() ?>

        <div class="col-md-12">
            <div id="progress-button" class="progress-button">
                <button form="reset-form" class="bounceIn animated">
                    <span><?= Yii::t('frontend', 'Send') ?></span>
                </button>

                <svg class="progress-circle" width="70" height="70">
                    <path d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803
                    -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197
                    -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z"/>
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
    </div>
</div>

<script>
    [].slice.call(document.querySelectorAll('.progress-button')).forEach(function(bttn, pos) {
        new UIProgressButton( bttn, {
            callback : function(instance) {
                var progress = 0;
                var success = 1;
                var error = -1;

                var interval = setInterval(function() {
                    icon(pos, instance, progress, success, error, interval);
                }, 1000);
            }
        } );
    } );

    jQuery(function($) {
        $('.forget-a').click(function() {
            showModal('login');
        });
    });
</script>